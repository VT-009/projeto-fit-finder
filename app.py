"""Servidor Flask e camada PostgreSQL do FitFinder.

As páginas do front-end permanecem estáticas. Dados pessoais e sessões passam
a ser servidos pela API JSON e armazenados no PostgreSQL.
"""

from contextlib import contextmanager
import ast
from datetime import date, datetime, timedelta, timezone
from functools import wraps
import math
import os
from pathlib import Path
import re
import threading

import psycopg2
from psycopg2.errors import UniqueViolation
from psycopg2.extras import Json, RealDictCursor
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request, send_from_directory, session
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash


ROOT_DIR = Path(__file__).resolve().parent
load_dotenv(ROOT_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL não foi definida no arquivo .env.")

EMAIL_RE = re.compile(
    r"^[A-Z0-9._%+-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?"
    r"(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$",
    re.IGNORECASE,
)
ALLOWED_HTML = {
    "index.html", "detalhes.html", "login.html", "cadastro.html",
    "recuperar-senha.html", "treinos.html", "avaliacao.html", "agua.html",
    "perfil.html", "404.html",
}
ALLOWED_ASSET_TYPES = {
    "CSS": {".css"},
    "js": {".js"},
    "imagens": {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"},
}

app = Flask(__name__, static_folder=None)
app.config.update(
    SECRET_KEY=os.getenv("SECRET_KEY", "chave_secreta_fitfinder"),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true",
    SESSION_COOKIE_PATH="/",
)

_schema_lock = threading.Lock()
_schema_initialized = False


@contextmanager
def get_db_connection():
    """Abre conexão por operação e garante commit/rollback e fechamento."""
    connection = psycopg2.connect(DATABASE_URL)
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def load_academia_seed():
    """Lê o objeto de dados existente em js/dados-academias.js sem Node.js."""
    source = (ROOT_DIR / "js" / "dados-academias.js").read_text(encoding="utf-8")
    match = re.search(r"window\.dadosAcademias\s*=\s*\{([\s\S]*?)\n\};", source)
    if not match:
        raise RuntimeError("Não foi possível localizar window.dadosAcademias no arquivo JS.")
    body = re.sub(r"/\*[\s\S]*?\*/", "", match.group(1))
    body = re.sub(r"(?m)^(\s*)([A-Za-z_$][\w$]*)\s*:", r"\1'\2':", body)
    data = ast.literal_eval("{" + body + "}")
    if len(data) != 14:
        raise RuntimeError(f"Esperadas 14 academias no seed; encontradas {len(data)}.")
    return data


def migrate_legacy_schema(cursor):
    """Adiciona nomes/colunas do schema atual sem apagar dados antigos."""
    statements = [
        "ALTER TABLE academias ADD COLUMN IF NOT EXISTS preco TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE academias ADD COLUMN IF NOT EXISTS nota NUMERIC(3,1) NOT NULL DEFAULT 0",
        "ALTER TABLE academias ADD COLUMN IF NOT EXISTS endereco TEXT NOT NULL DEFAULT ''",
        "ALTER TABLE academias ADD COLUMN IF NOT EXISTS telefone VARCHAR(60) NOT NULL DEFAULT ''",
        "ALTER TABLE academias ADD COLUMN IF NOT EXISTS instagram VARCHAR(120) NOT NULL DEFAULT ''",
        "ALTER TABLE academias ADD COLUMN IF NOT EXISTS dados JSONB NOT NULL DEFAULT '{}'::jsonb",
        "ALTER TABLE avaliacoes_fisicas ADD COLUMN IF NOT EXISTS atividade NUMERIC(5,3)",
        "ALTER TABLE avaliacoes_fisicas ADD COLUMN IF NOT EXISTS data DATE",
        "ALTER TABLE avaliacoes_fisicas ADD COLUMN IF NOT EXISTS fator_atividade NUMERIC(5,3)",
        "ALTER TABLE avaliacoes_fisicas ADD COLUMN IF NOT EXISTS data_avaliacao DATE",
        "UPDATE avaliacoes_fisicas SET atividade = COALESCE(atividade, fator_atividade, 1.2), data = COALESCE(data, data_avaliacao, CURRENT_DATE)",
        "ALTER TABLE avaliacoes_fisicas ALTER COLUMN atividade SET DEFAULT 1.2",
        "ALTER TABLE avaliacoes_fisicas ALTER COLUMN atividade SET NOT NULL",
        "ALTER TABLE avaliacoes_fisicas ALTER COLUMN data SET DEFAULT CURRENT_DATE",
        "ALTER TABLE avaliacoes_fisicas ALTER COLUMN data SET NOT NULL",
        "ALTER TABLE registros_agua ADD COLUMN IF NOT EXISTS data DATE",
        "ALTER TABLE registros_agua ADD COLUMN IF NOT EXISTS data_registro DATE",
        "UPDATE registros_agua SET data = COALESCE(data, data_registro, CURRENT_DATE)",
        "ALTER TABLE registros_agua ALTER COLUMN data SET DEFAULT CURRENT_DATE",
        "ALTER TABLE registros_agua ALTER COLUMN data SET NOT NULL",
        "CREATE UNIQUE INDEX IF NOT EXISTS ux_registros_agua_usuario_data ON registros_agua(usuario_id, data)",
        "ALTER TABLE comentarios ADD COLUMN IF NOT EXISTS academia_id BIGINT",
        "ALTER TABLE comentarios ADD COLUMN IF NOT EXISTS academia_slug VARCHAR(120)",
        "UPDATE academias SET preco = COALESCE(NULLIF(preco, ''), dados->>'preco', ''), "
        "nota = COALESCE(NULLIF(nota, 0), NULLIF(dados->>'nota', '')::numeric, 0), "
        "endereco = COALESCE(NULLIF(endereco, ''), dados->>'endereco', ''), "
        "telefone = COALESCE(NULLIF(telefone, ''), dados->>'telefone', ''), "
        "instagram = COALESCE(NULLIF(instagram, ''), dados->>'instagram', '')",
    ]
    for statement in statements:
        cursor.execute(statement)


def seed_academias(cursor):
    cursor.execute("SELECT COUNT(*) FROM academias")
    if cursor.fetchone()[0] != 0:
        return
    academias = load_academia_seed()
    for slug, academia in academias.items():
        cursor.execute(
            "INSERT INTO academias (slug, nome, bairro, preco, nota, endereco, telefone, instagram, dados) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (slug) DO NOTHING",
            (slug, academia["nome"], academia.get("bairro", ""), academia.get("preco", ""),
             float(academia.get("nota", 0)), academia.get("endereco", ""), academia.get("telefone", ""),
             academia.get("instagram", ""), Json(academia)),
        )


def init_db():
    """Cria/migra as tabelas e popula o catálogo de academias no primeiro início."""
    global _schema_initialized
    if _schema_initialized:
        return
    with _schema_lock:
        if _schema_initialized:
            return
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                schema = (ROOT_DIR / "schema.sql").read_text(encoding="utf-8")
                for statement in schema.split(";"):
                    if statement.strip():
                        cursor.execute(statement)
                migrate_legacy_schema(cursor)
                seed_academias(cursor)
                cursor.execute(
                    "UPDATE comentarios c SET academia_id = a.id FROM academias a "
                    "WHERE c.academia_id IS NULL AND c.academia_slug = a.slug"
                )
                cursor.execute("SELECT 1 FROM pg_constraint WHERE conname = 'fk_comentarios_academia'")
                if not cursor.fetchone():
                    cursor.execute(
                        "ALTER TABLE comentarios ADD CONSTRAINT fk_comentarios_academia "
                        "FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE"
                    )
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_treinos_usuario ON treinos(usuario_id)")
                cursor.execute("DROP INDEX IF EXISTS idx_avaliacoes_usuario_data")
                cursor.execute("CREATE INDEX idx_avaliacoes_usuario_data ON avaliacoes_fisicas(usuario_id, data DESC)")
                cursor.execute("DROP INDEX IF EXISTS idx_comentarios_academia_data")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_comentarios_academia_data ON comentarios(academia_id, criado_em DESC)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_feedback_site_data ON feedback_site(criado_em DESC)")
        _schema_initialized = True


def get_json_body():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return None
    return payload


def api_error(message, status):
    return jsonify({"erro": message}), status


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("user_id"):
            return api_error("Entre na sua conta para acessar este recurso.", 401)
        return view(*args, **kwargs)
    return wrapped


def parse_positive_number(value, label, allow_decimal=True):
    try:
        if isinstance(value, bool):
            raise ValueError
        if allow_decimal:
            number = float(value)
        else:
            number = int(value)
            if float(value) != number:
                raise ValueError
    except (TypeError, ValueError):
        raise ValueError(f"Informe {label} com um valor numérico válido.")
    if not math.isfinite(number) or number <= 0:
        raise ValueError(f"Informe {label} com um valor maior que zero.")
    return number


def serialize_user(row):
    return {"id": row["id"], "nome": row["nome"], "email": row["email"]}


def brasilia_date():
    return datetime.now(timezone(timedelta(hours=-3))).date()


@app.before_request
def initialize_schema_for_api():
    # Ao executar app.py, o esquema é criado antes de aceitar tráfego. Esta
    # proteção também cobre servidores WSGI que importam o módulo diretamente.
    if request.path.startswith("/api/"):
        init_db()


@app.errorhandler(psycopg2.Error)
def handle_database_error(error):
    app.logger.error("Falha ao acessar o PostgreSQL: %s", error)
    return api_error("Não foi possível acessar o banco de dados.", 503)


@app.errorhandler(HTTPException)
def handle_http_error(error):
    if request.path.startswith("/api/"):
        return api_error(error.description, error.code or 500)
    return error


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve apenas páginas do FitFinder e seus diretórios de ativos."""
    if path.startswith("api/"):
        abort(404)
    if not path:
        path = "index.html"
    parts = Path(path).parts
    if any(part in {".", ".."} or part.startswith(".") for part in parts):
        abort(404)
    if len(parts) == 1 and path in ALLOWED_HTML:
        return send_from_directory(ROOT_DIR, path)
    if len(parts) >= 2 and parts[0] in ALLOWED_ASSET_TYPES and Path(path).suffix.lower() in ALLOWED_ASSET_TYPES[parts[0]]:
        return send_from_directory(ROOT_DIR, path)
    abort(404)


@app.post("/api/cadastro")
def api_cadastro():
    payload = get_json_body()
    if payload is None:
        return api_error("Envie os dados da conta em formato JSON.", 400)
    nome = payload.get("nome", "")
    email = payload.get("email", "")
    senha = payload.get("senha", "")
    nome = nome.strip() if isinstance(nome, str) else ""
    email = email.strip().lower() if isinstance(email, str) else ""
    senha = senha if isinstance(senha, str) else ""
    if not nome or len(nome) > 120:
        return api_error("Informe um nome válido com até 120 caracteres.", 400)
    if not EMAIL_RE.fullmatch(email):
        return api_error("Digite um endereço de e-mail válido.", 400)
    if len(senha) < 8:
        return api_error("A senha precisa ter pelo menos 8 caracteres.", 400)

    try:
        with get_db_connection() as connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "INSERT INTO usuarios (nome, email, senha_hash) VALUES (%s, %s, %s) "
                    "RETURNING id, nome, email",
                    (nome, email, generate_password_hash(senha)),
                )
                usuario = serialize_user(cursor.fetchone())
    except UniqueViolation:
        return api_error("Este e-mail já está cadastrado. Faça login.", 409)
    session.clear()
    session["user_id"] = usuario["id"]
    return jsonify({"usuario": usuario, "mensagem": "Conta criada com sucesso."}), 201


@app.post("/api/login")
def api_login():
    payload = get_json_body()
    if payload is None:
        return api_error("Envie e-mail e senha em formato JSON.", 400)
    email_value = payload.get("email", "")
    senha_value = payload.get("senha", "")
    email = email_value.strip().lower() if isinstance(email_value, str) else ""
    senha = senha_value if isinstance(senha_value, str) else ""
    if not EMAIL_RE.fullmatch(email) or not senha:
        return api_error("E-mail ou senha incorretos.", 401)
    with get_db_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, nome, email, senha_hash FROM usuarios WHERE email = %s", (email,))
            usuario = cursor.fetchone()
    if not usuario or not check_password_hash(usuario["senha_hash"], senha):
        return api_error("E-mail ou senha incorretos.", 401)
    session.clear()
    session["user_id"] = usuario["id"]
    return jsonify({"usuario": serialize_user(usuario), "mensagem": "Login realizado com sucesso."})


@app.post("/api/logout")
def api_logout():
    session.clear()
    return jsonify({"mensagem": "Sessão encerrada."})


@app.get("/api/sessao")
def api_sessao():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"autenticado": False, "usuario": None})
    with get_db_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT id, nome, email FROM usuarios WHERE id = %s", (user_id,))
            usuario = cursor.fetchone()
    if not usuario:
        session.clear()
        return jsonify({"autenticado": False, "usuario": None})
    return jsonify({"autenticado": True, "usuario": serialize_user(usuario)})


@app.route("/api/treinos", methods=["GET", "POST"])
@login_required
def api_treinos():
    user_id = session["user_id"]
    if request.method == "GET":
        with get_db_connection() as connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "SELECT id, exercicio, series, categorias, criado_em FROM treinos "
                    "WHERE usuario_id = %s ORDER BY criado_em DESC, id DESC", (user_id,)
                )
                return jsonify({"treinos": cursor.fetchall()})

    payload = get_json_body()
    if payload is None:
        return api_error("Envie os dados do treino em formato JSON.", 400)
    exercicio_value = payload.get("exercicio", "")
    series_value = payload.get("series", "")
    exercicio = exercicio_value.strip() if isinstance(exercicio_value, str) else ""
    series = series_value.strip() if isinstance(series_value, str) else ""
    categorias = payload.get("categorias", [])
    if not exercicio or not series or len(exercicio) > 180 or len(series) > 120:
        return api_error("Informe exercício e séries válidos.", 400)
    if not isinstance(categorias, list) or not categorias or any(not isinstance(item, str) for item in categorias):
        return api_error("Selecione ao menos um grupo muscular.", 400)
    with get_db_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "INSERT INTO treinos (usuario_id, exercicio, series, categorias) "
                "VALUES (%s, %s, %s, %s) RETURNING id, exercicio, series, categorias, criado_em",
                (user_id, exercicio, series, categorias),
            )
            treino = cursor.fetchone()
    return jsonify({"treino": treino}), 201


@app.route("/api/treinos/<int:treino_id>", methods=["PUT", "DELETE"])
@login_required
def api_treino_item(treino_id):
    user_id = session["user_id"]
    if request.method == "DELETE":
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM treinos WHERE id = %s AND usuario_id = %s", (treino_id, user_id))
                if cursor.rowcount == 0:
                    return api_error("Treino não encontrado.", 404)
        return jsonify({"mensagem": "Treino excluído."})
    payload = get_json_body()
    if payload is None:
        return api_error("Envie os dados do treino em formato JSON.", 400)
    exercicio_value = payload.get("exercicio", "")
    series_value = payload.get("series", "")
    exercicio = exercicio_value.strip() if isinstance(exercicio_value, str) else ""
    series = series_value.strip() if isinstance(series_value, str) else ""
    categorias = payload.get("categorias", [])
    if (not exercicio or not series or len(exercicio) > 180 or len(series) > 120
            or not isinstance(categorias, list) or not categorias
            or any(not isinstance(item, str) for item in categorias)):
        return api_error("Informe exercício, séries e ao menos um grupo muscular.", 400)
    with get_db_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "UPDATE treinos SET exercicio = %s, series = %s, categorias = %s "
                "WHERE id = %s AND usuario_id = %s "
                "RETURNING id, exercicio, series, categorias, criado_em",
                (exercicio, series, categorias, treino_id, user_id),
            )
            treino = cursor.fetchone()
    if not treino:
        return api_error("Treino não encontrado.", 404)
    return jsonify({"treino": treino})


def calcular_avaliacao(payload):
    try:
        sexo = str(payload.get("sexo", "")).strip().lower()
        idade = int(parse_positive_number(payload.get("idade"), "a idade", allow_decimal=False))
        peso = parse_positive_number(payload.get("peso"), "o peso")
        altura = parse_positive_number(payload.get("altura"), "a altura")
        fator = float(payload.get("fator_atividade", payload.get("atividade", 1.2)))
        if sexo not in {"m", "f"}:
            raise ValueError("Informe o sexo como 'm' ou 'f'.")
        if fator not in {1.2, 1.375, 1.55, 1.725, 1.9}:
            raise ValueError("Selecione um fator de atividade válido.")
        tmb = 66 + 13.7 * peso + 5 * altura - 6.8 * idade if sexo == "m" else 655 + 9.6 * peso + 1.8 * altura - 4.7 * idade
        calorias = round(tmb * fator)
        meta_agua = round(peso * 35)
        if calorias <= 0 or meta_agua <= 0:
            raise ValueError("Os dados informados não geraram resultados válidos.")
        data = payload.get("data")
        data_avaliacao = date.fromisoformat(data) if data else brasilia_date()
        anotacao = str(payload.get("anotacao", "")).strip()
        return sexo, idade, peso, altura, fator, calorias, meta_agua, anotacao, data_avaliacao
    except (TypeError, ValueError) as error:
        raise ValueError(str(error)) from error


@app.route("/api/avaliacoes", methods=["GET", "POST"])
@login_required
def api_avaliacoes():
    user_id = session["user_id"]
    if request.method == "GET":
        with get_db_connection() as connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "SELECT id, sexo, idade, peso, altura, fator_atividade, calorias, meta_agua, "
                    "anotacao, data_avaliacao FROM avaliacoes_fisicas "
                    "WHERE usuario_id = %s ORDER BY data_avaliacao DESC, id DESC", (user_id,)
                )
                return jsonify({"avaliacoes": cursor.fetchall()})
    payload = get_json_body()
    if payload is None:
        return api_error("Envie os dados da avaliação em formato JSON.", 400)
    try:
        valores = calcular_avaliacao(payload)
    except ValueError as error:
        return api_error(str(error), 400)
    with get_db_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "INSERT INTO avaliacoes_fisicas "
                "(usuario_id, sexo, idade, peso, altura, fator_atividade, calorias, meta_agua, anotacao, data_avaliacao) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
                "RETURNING id, sexo, idade, peso, altura, fator_atividade, calorias, meta_agua, anotacao, data_avaliacao",
                (user_id, *valores),
            )
            avaliacao = cursor.fetchone()
    return jsonify({"avaliacao": avaliacao}), 201


@app.delete("/api/avaliacoes/<int:avaliacao_id>")
@login_required
def api_avaliacao_item(avaliacao_id):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM avaliacoes_fisicas WHERE id = %s AND usuario_id = %s",
                (avaliacao_id, session["user_id"]),
            )
            if cursor.rowcount == 0:
                return api_error("Avaliação física não encontrada.", 404)
    return jsonify({"mensagem": "Avaliação física excluída."})


def parse_request_date(value):
    if not value:
        return brasilia_date()
    try:
        return date.fromisoformat(value)
    except (TypeError, ValueError):
        raise ValueError("Informe a data no formato AAAA-MM-DD.")


@app.route("/api/agua", methods=["GET", "POST", "PUT", "DELETE"])
@login_required
def api_agua():
    user_id = session["user_id"]
    try:
        data_registro = parse_request_date(request.args.get("data") or (get_json_body() or {}).get("data"))
    except ValueError as error:
        return api_error(str(error), 400)

    if request.method == "GET":
        with get_db_connection() as connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(
                    "SELECT data_registro, total_ml FROM registros_agua "
                    "WHERE usuario_id = %s AND data_registro = %s", (user_id, data_registro)
                )
                registro = cursor.fetchone()
        return jsonify({"data": data_registro.isoformat(), "total_ml": registro["total_ml"] if registro else 0})

    if request.method == "DELETE":
        with get_db_connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM registros_agua WHERE usuario_id = %s AND data_registro = %s",
                    (user_id, data_registro),
                )
        return jsonify({"data": data_registro.isoformat(), "total_ml": 0})

    payload = get_json_body()
    if payload is None:
        return api_error("Envie o registro de água em formato JSON.", 400)
    try:
        if request.method == "PUT":
            total = int(payload.get("total_ml"))
            if total < 0:
                raise ValueError
            sql = (
                "INSERT INTO registros_agua (usuario_id, data_registro, total_ml) VALUES (%s, %s, %s) "
                "ON CONFLICT (usuario_id, data_registro) DO UPDATE SET total_ml = EXCLUDED.total_ml, "
                "atualizado_em = NOW() RETURNING data_registro, total_ml"
            )
            values = (user_id, data_registro, total)
        else:
            delta = int(payload.get("delta_ml"))
            sql = (
                "INSERT INTO registros_agua (usuario_id, data_registro, total_ml) VALUES (%s, %s, GREATEST(%s, 0)) "
                "ON CONFLICT (usuario_id, data_registro) DO UPDATE SET total_ml = GREATEST(registros_agua.total_ml + %s, 0), "
                "atualizado_em = NOW() RETURNING data_registro, total_ml"
            )
            values = (user_id, data_registro, delta, delta)
    except (TypeError, ValueError):
        return api_error("Informe uma quantidade de água em mililitros válida.", 400)
    with get_db_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(sql, values)
            registro = cursor.fetchone()
    return jsonify(registro)


@app.route("/api/comentarios", methods=["GET", "POST"])
def api_comentarios():
    if request.method == "GET":
        academia_slug = request.args.get("academia")
        with get_db_connection() as connection:
            with connection.cursor(cursor_factory=RealDictCursor) as cursor:
                if academia_slug:
                    cursor.execute(
                        "SELECT c.id, c.academia_slug, c.nota, c.texto, c.criado_em, u.nome AS autor "
                        "FROM comentarios c JOIN usuarios u ON u.id = c.usuario_id "
                        "WHERE c.academia_slug = %s ORDER BY c.criado_em DESC", (academia_slug,)
                    )
                else:
                    cursor.execute(
                        "SELECT c.id, c.academia_slug, c.nota, c.texto, c.criado_em, u.nome AS autor "
                        "FROM comentarios c JOIN usuarios u ON u.id = c.usuario_id "
                        "ORDER BY c.criado_em DESC"
                    )
                return jsonify({"comentarios": cursor.fetchall()})

    if not session.get("user_id"):
        return api_error("Entre na sua conta para publicar um comentário.", 401)
    payload = get_json_body()
    if payload is None:
        return api_error("Envie o comentário em formato JSON.", 400)
    texto_value = payload.get("texto", "")
    slug_value = payload.get("academia_slug", "")
    texto = texto_value.strip() if isinstance(texto_value, str) else ""
    academia_slug = (slug_value.strip()[:120] or None) if isinstance(slug_value, str) else None
    try:
        nota_original = payload.get("nota")
        nota = int(nota_original)
        if isinstance(nota_original, bool) or float(nota_original) != nota:
            raise ValueError
    except (TypeError, ValueError):
        return api_error("A nota deve ser um valor de 1 a 5.", 400)
    if not texto or len(texto) > 5000:
        return api_error("Escreva um comentário com até 5.000 caracteres.", 400)
    if nota < 1 or nota > 5:
        return api_error("A nota deve ser um valor de 1 a 5.", 400)
    with get_db_connection() as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "INSERT INTO comentarios (usuario_id, academia_slug, nota, texto) "
                "VALUES (%s, %s, %s, %s) RETURNING id, academia_slug, nota, texto, criado_em",
                (session["user_id"], academia_slug, nota, texto),
            )
            comentario = cursor.fetchone()
    return jsonify({"comentario": comentario}), 201


def main():
    try:
        init_db()
    except psycopg2.Error as error:
        raise SystemExit(
            "Não foi possível conectar ao PostgreSQL. Confira DATABASE_URL, a senha e "
            "se o banco 'fitfinder' já foi criado."
        ) from error
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG", "false").lower() == "true")


if __name__ == "__main__":
    main()
