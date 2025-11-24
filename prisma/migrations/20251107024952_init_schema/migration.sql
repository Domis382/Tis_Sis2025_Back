-- CreateEnum
CREATE TYPE "actor_tipo_t" AS ENUM ('ADMINISTRADOR', 'COORDINADOR', 'RESPONSABLE_AREA', 'EVALUADOR', 'SISTEMA');

-- CreateEnum
CREATE TYPE "estado_admin_t" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "estado_clasificado_t" AS ENUM ('CLASIFICADO', 'NO_CLASIFICADO', 'DESCLASIFICADO');

-- CreateEnum
CREATE TYPE "estado_inscripcion_t" AS ENUM ('ACTIVA', 'DESCLASIFICADA');

-- CreateEnum
CREATE TYPE "resultado_audit_t" AS ENUM ('OK', 'ERROR');

-- CreateEnum
CREATE TYPE "tipo_lista_t" AS ENUM ('CERTIFICADOS', 'CEREMONIA', 'PUBLICACION');

-- CreateTable
CREATE TABLE "administrador" (
    "id_administrador" BIGSERIAL NOT NULL,
    "nombre_admin" VARCHAR(100) NOT NULL,
    "apellido_admin" VARCHAR(100) NOT NULL,
    "correo_admin" VARCHAR(150) NOT NULL,
    "estado" "estado_admin_t" NOT NULL DEFAULT 'ACTIVO',
    "fecha_registro" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id_area" BIGINT,
    "id_coordinador" BIGINT,
    "id_parametro" BIGINT,
    "id_listas" BIGINT,
    "id_auditoria" BIGINT,

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("id_administrador")
);

-- CreateTable
CREATE TABLE "area" (
    "id_area" BIGSERIAL NOT NULL,
    "nombre_area" VARCHAR(100) NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id_area")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id_auditoria" BIGSERIAL NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_tipo" "actor_tipo_t" NOT NULL,
    "id_actor" BIGINT,
    "actor_nombre_snapshot" VARCHAR(200),
    "accion" VARCHAR(100) NOT NULL,
    "entidad" VARCHAR(100) NOT NULL,
    "id_entidad" BIGINT,
    "valor_anterior" TEXT,
    "valor_nuevo" TEXT,
    "resultado" "resultado_audit_t" NOT NULL DEFAULT 'OK',
    "motivo_error" TEXT,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "clasificados" (
    "id_clasificado" BIGSERIAL NOT NULL,
    "id_inscrito" BIGINT NOT NULL,
    "id_fase" BIGINT NOT NULL,
    "estado" "estado_clasificado_t" NOT NULL,

    CONSTRAINT "clasificados_pkey" PRIMARY KEY ("id_clasificado")
);

-- CreateTable
CREATE TABLE "coordinador_area" (
    "id_coordinador" BIGSERIAL NOT NULL,
    "nombre_coordinador" VARCHAR(100) NOT NULL,
    "apellidos_coordinador" VARCHAR(100) NOT NULL,
    "id_area" BIGINT NOT NULL,

    CONSTRAINT "coordinador_area_pkey" PRIMARY KEY ("id_coordinador")
);

-- CreateTable
CREATE TABLE "evaluaciones" (
    "id_evaluacion" BIGSERIAL NOT NULL,
    "id_inscrito" BIGINT NOT NULL,
    "id_evaluador" BIGINT NOT NULL,
    "id_fase" BIGINT NOT NULL,
    "nota" DECIMAL(6,2),
    "observacion" TEXT,
    "fecha" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id_evaluacion")
);

-- CreateTable
CREATE TABLE "evaluador" (
    "id_evaluador" BIGSERIAL NOT NULL,
    "nombre_evaluado" VARCHAR(100) NOT NULL,
    "apellidos_evaluador" VARCHAR(100) NOT NULL,
    "id_area" BIGINT NOT NULL,

    CONSTRAINT "evaluador_pkey" PRIMARY KEY ("id_evaluador")
);

-- CreateTable
CREATE TABLE "fases" (
    "id_fases" BIGSERIAL NOT NULL,
    "nombre_fase" VARCHAR(50) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "fases_pkey" PRIMARY KEY ("id_fases")
);

-- CreateTable
CREATE TABLE "importaciones" (
    "id_import" BIGSERIAL NOT NULL,
    "id_coordinador" BIGINT NOT NULL,
    "fecha_hora" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "total_registro" INTEGER NOT NULL DEFAULT 0,
    "total_ok" INTEGER NOT NULL DEFAULT 0,
    "total_error" INTEGER NOT NULL DEFAULT 0,
    "detalle_errores" TEXT,

    CONSTRAINT "importaciones_pkey" PRIMARY KEY ("id_import")
);

-- CreateTable
CREATE TABLE "inscritos" (
    "id_inscritos" BIGSERIAL NOT NULL,
    "nombres_inscrito" VARCHAR(100) NOT NULL,
    "apellidos_inscrito" VARCHAR(100) NOT NULL,
    "ci_inscrito" VARCHAR(40),
    "id_nivel" BIGINT NOT NULL,
    "id_area" BIGINT NOT NULL,
    "estado" "estado_inscripcion_t" NOT NULL DEFAULT 'ACTIVA',
    "id_import" BIGINT,
    "colegio" VARCHAR(150),
    "contacto_tutor" VARCHAR(50),
    "unidad_educativa" VARCHAR(150),
    "departamento" VARCHAR(50),
    "grado_escolaridad" VARCHAR(50),
    "tutor_academico" VARCHAR(150),

    CONSTRAINT "inscritos_pkey" PRIMARY KEY ("id_inscritos")
);

-- CreateTable
CREATE TABLE "listas_publicadas" (
    "id_listas" BIGSERIAL NOT NULL,
    "id_fase" BIGINT NOT NULL,
    "id_area" BIGINT NOT NULL,
    "tipolista" "tipo_lista_t" NOT NULL,
    "fecha_publica" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listas_publicadas_pkey" PRIMARY KEY ("id_listas")
);

-- CreateTable
CREATE TABLE "nivel" (
    "id_nivel" BIGSERIAL NOT NULL,
    "nombre_nivel" VARCHAR(100) NOT NULL,

    CONSTRAINT "nivel_pkey" PRIMARY KEY ("id_nivel")
);

-- CreateTable
CREATE TABLE "parametro_medallero" (
    "id_parametro" BIGSERIAL NOT NULL,
    "id_area" BIGINT NOT NULL,
    "cantidad_oros" INTEGER NOT NULL DEFAULT 1,
    "cantidad_platas" INTEGER NOT NULL DEFAULT 1,
    "cantidad_bronces" INTEGER NOT NULL DEFAULT 1,
    "menciones" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "parametro_medallero_pkey" PRIMARY KEY ("id_parametro")
);

-- CreateTable
CREATE TABLE "responsable_area" (
    "id_responsable" BIGSERIAL NOT NULL,
    "nombres_evaluador" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "correo_electronico" VARCHAR(150) NOT NULL,
    "usuario_responsable" VARCHAR(60) NOT NULL,
    "pass_responsable" VARCHAR(200) NOT NULL,
    "id_area" BIGINT NOT NULL,

    CONSTRAINT "responsable_area_pkey" PRIMARY KEY ("id_responsable")
);

-- CreateIndex
CREATE UNIQUE INDEX "administrador_correo_admin_key" ON "administrador"("correo_admin");

-- CreateIndex
CREATE UNIQUE INDEX "area_nombre_area_key" ON "area"("nombre_area");

-- CreateIndex
CREATE INDEX "ix_auditoria_actor" ON "auditoria"("actor_tipo", "id_actor");

-- CreateIndex
CREATE INDEX "ix_auditoria_entidad" ON "auditoria"("entidad", "id_entidad");

-- CreateIndex
CREATE INDEX "ix_auditoria_fecha" ON "auditoria"("fecha_hora");

-- CreateIndex
CREATE INDEX "ix_clasif_fase" ON "clasificados"("id_fase");

-- CreateIndex
CREATE UNIQUE INDEX "uq_clasif_unica" ON "clasificados"("id_inscrito", "id_fase");

-- CreateIndex
CREATE INDEX "ix_eval_evaluador" ON "evaluaciones"("id_evaluador");

-- CreateIndex
CREATE INDEX "ix_eval_inscrito_fase" ON "evaluaciones"("id_inscrito", "id_fase");

-- CreateIndex
CREATE UNIQUE INDEX "uq_eval_unica" ON "evaluaciones"("id_inscrito", "id_evaluador", "id_fase");

-- CreateIndex
CREATE UNIQUE INDEX "fases_nombre_fase_key" ON "fases"("nombre_fase");

-- CreateIndex
CREATE INDEX "ix_import_coord_fecha" ON "importaciones"("id_coordinador", "fecha_hora");

-- CreateIndex
CREATE INDEX "ix_inscritos_area_nivel" ON "inscritos"("id_area", "id_nivel");

-- CreateIndex
CREATE INDEX "ix_listas_area_fase" ON "listas_publicadas"("id_area", "id_fase");

-- CreateIndex
CREATE UNIQUE INDEX "nivel_nombre_nivel_key" ON "nivel"("nombre_nivel");

-- CreateIndex
CREATE UNIQUE INDEX "parametro_medallero_id_area_key" ON "parametro_medallero"("id_area");

-- CreateIndex
CREATE UNIQUE INDEX "responsable_area_correo_electronico_key" ON "responsable_area"("correo_electronico");

-- CreateIndex
CREATE UNIQUE INDEX "responsable_area_usuario_responsable_key" ON "responsable_area"("usuario_responsable");

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_id_coordinador_fkey" FOREIGN KEY ("id_coordinador") REFERENCES "coordinador_area"("id_coordinador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_id_listas_fkey" FOREIGN KEY ("id_listas") REFERENCES "listas_publicadas"("id_listas") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_id_parametro_fkey" FOREIGN KEY ("id_parametro") REFERENCES "parametro_medallero"("id_parametro") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "fk_admin_auditoria" FOREIGN KEY ("id_auditoria") REFERENCES "auditoria"("id_auditoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clasificados" ADD CONSTRAINT "clasificados_id_fase_fkey" FOREIGN KEY ("id_fase") REFERENCES "fases"("id_fases") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clasificados" ADD CONSTRAINT "clasificados_id_inscrito_fkey" FOREIGN KEY ("id_inscrito") REFERENCES "inscritos"("id_inscritos") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinador_area" ADD CONSTRAINT "coordinador_area_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_id_evaluador_fkey" FOREIGN KEY ("id_evaluador") REFERENCES "evaluador"("id_evaluador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_id_fase_fkey" FOREIGN KEY ("id_fase") REFERENCES "fases"("id_fases") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_id_inscrito_fkey" FOREIGN KEY ("id_inscrito") REFERENCES "inscritos"("id_inscritos") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluador" ADD CONSTRAINT "evaluador_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "importaciones" ADD CONSTRAINT "importaciones_id_coordinador_fkey" FOREIGN KEY ("id_coordinador") REFERENCES "coordinador_area"("id_coordinador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscritos" ADD CONSTRAINT "inscritos_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscritos" ADD CONSTRAINT "inscritos_id_import_fkey" FOREIGN KEY ("id_import") REFERENCES "importaciones"("id_import") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscritos" ADD CONSTRAINT "inscritos_id_nivel_fkey" FOREIGN KEY ("id_nivel") REFERENCES "nivel"("id_nivel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas_publicadas" ADD CONSTRAINT "listas_publicadas_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listas_publicadas" ADD CONSTRAINT "listas_publicadas_id_fase_fkey" FOREIGN KEY ("id_fase") REFERENCES "fases"("id_fases") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parametro_medallero" ADD CONSTRAINT "parametro_medallero_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsable_area" ADD CONSTRAINT "responsable_area_id_area_fkey" FOREIGN KEY ("id_area") REFERENCES "area"("id_area") ON DELETE RESTRICT ON UPDATE CASCADE;
