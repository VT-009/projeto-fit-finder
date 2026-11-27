CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academias (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    nome VARCHAR(180) NOT NULL,
    bairro VARCHAR(120) NOT NULL DEFAULT '',
    preco TEXT NOT NULL DEFAULT '',
    nota NUMERIC(3, 1) NOT NULL DEFAULT 0,
    endereco TEXT NOT NULL DEFAULT '',
    telefone VARCHAR(60) NOT NULL DEFAULT '',
    instagram VARCHAR(120) NOT NULL DEFAULT '',
    dados JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS treinos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    exercicio VARCHAR(180) NOT NULL,
    series VARCHAR(120) NOT NULL,
    categorias TEXT[] NOT NULL DEFAULT '{}',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS avaliacoes_fisicas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    peso NUMERIC(7, 2) NOT NULL CHECK (peso > 0),
    altura NUMERIC(7, 2) NOT NULL CHECK (altura > 0),
    idade INTEGER NOT NULL CHECK (idade > 0),
    sexo VARCHAR(20) NOT NULL CHECK (sexo IN ('m', 'f')),
    atividade NUMERIC(5, 3) NOT NULL DEFAULT 1.2 CHECK (atividade > 0),
    calorias INTEGER NOT NULL CHECK (calorias > 0),
    meta_agua INTEGER NOT NULL CHECK (meta_agua > 0),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    anotacao TEXT NOT NULL DEFAULT '',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registros_agua (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    total_ml INTEGER NOT NULL DEFAULT 0 CHECK (total_ml >= 0),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, data)
);

CREATE TABLE IF NOT EXISTS comentarios (
    id BIGSERIAL PRIMARY KEY,
    academia_id BIGINT,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nota SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    texto TEXT NOT NULL CHECK (LENGTH(BTRIM(texto)) > 0),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_comentarios_academia FOREIGN KEY (academia_id) REFERENCES academias(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback_site (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nota SMALLINT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    texto TEXT NOT NULL CHECK (LENGTH(BTRIM(texto)) > 0),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

