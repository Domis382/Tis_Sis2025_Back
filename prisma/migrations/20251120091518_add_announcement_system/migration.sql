-- CreateEnum
CREATE TYPE "tipo_anuncio_t" AS ENUM ('GENERAL', 'URGENTE', 'IMPORTANTE', 'EVENTO', 'NOTICIA', 'SISTEMA');

-- CreateEnum
CREATE TYPE "estado_anuncio_t" AS ENUM ('BORRADOR', 'ACTIVO', 'INACTIVO', 'EXPIRADO');

-- CreateTable
CREATE TABLE "anuncio" (
    "id_anuncio" BIGSERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo_anuncio" "tipo_anuncio_t" NOT NULL DEFAULT 'GENERAL',
    "estado_anuncio" "estado_anuncio_t" NOT NULL DEFAULT 'ACTIVO',
    "fecha_publicacion" TIMESTAMP(6),
    "fecha_expiracion" TIMESTAMP(6),
    "id_administrador" BIGINT,
    "imagen_url" VARCHAR(500),
    "imagen_alt" VARCHAR(200),
    "es_destacado" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_area" BIGINT,

    CONSTRAINT "anuncio_pkey" PRIMARY KEY ("id_anuncio")
);

-- CreateTable
CREATE TABLE "archivo_anuncio" (
    "id_archivo" BIGSERIAL NOT NULL,
    "id_anuncio" BIGINT NOT NULL,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "url_archivo" VARCHAR(500) NOT NULL,
    "tipo_archivo" VARCHAR(100) NOT NULL,
    "tamaño" BIGINT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivo_anuncio_pkey" PRIMARY KEY ("id_archivo")
);

-- CreateTable
CREATE TABLE "anuncio_visto" (
    "id_visto" BIGSERIAL NOT NULL,
    "id_anuncio" BIGINT NOT NULL,
    "id_usuario" BIGINT NOT NULL,
    "visto_en" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anuncio_visto_pkey" PRIMARY KEY ("id_visto")
);

-- CreateIndex
CREATE INDEX "anuncio_estado_anuncio_idx" ON "anuncio"("estado_anuncio");

-- CreateIndex
CREATE INDEX "anuncio_tipo_anuncio_idx" ON "anuncio"("tipo_anuncio");

-- CreateIndex
CREATE INDEX "anuncio_fecha_publicacion_idx" ON "anuncio"("fecha_publicacion");

-- CreateIndex
CREATE INDEX "anuncio_es_destacado_idx" ON "anuncio"("es_destacado");

-- CreateIndex
CREATE INDEX "anuncio_id_area_idx" ON "anuncio"("id_area");

-- CreateIndex
CREATE INDEX "archivo_anuncio_id_anuncio_idx" ON "archivo_anuncio"("id_anuncio");

-- CreateIndex
CREATE INDEX "archivo_anuncio_tipo_archivo_idx" ON "archivo_anuncio"("tipo_archivo");

-- CreateIndex
CREATE INDEX "anuncio_visto_id_usuario_idx" ON "anuncio_visto"("id_usuario");

-- CreateIndex
CREATE INDEX "anuncio_visto_id_anuncio_idx" ON "anuncio_visto"("id_anuncio");

-- CreateIndex
CREATE UNIQUE INDEX "uq_anuncio_visto_unico" ON "anuncio_visto"("id_anuncio", "id_usuario");

-- AddForeignKey
ALTER TABLE "anuncio" ADD CONSTRAINT "anuncio_id_administrador_fkey" FOREIGN KEY ("id_administrador") REFERENCES "administrador"("id_administrador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anuncio" ADD CONSTRAINT "anuncio_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo_anuncio" ADD CONSTRAINT "archivo_anuncio_id_anuncio_fkey" FOREIGN KEY ("id_anuncio") REFERENCES "anuncio"("id_anuncio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anuncio_visto" ADD CONSTRAINT "anuncio_visto_id_anuncio_fkey" FOREIGN KEY ("id_anuncio") REFERENCES "anuncio"("id_anuncio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anuncio_visto" ADD CONSTRAINT "anuncio_visto_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
