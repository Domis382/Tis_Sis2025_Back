/*
  Warnings:

  - You are about to drop the column `pass_responsable` on the `responsable_area` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_responsable` on the `responsable_area` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_usuario]` on the table `administrador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_usuario]` on the table `coordinador_area` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_usuario]` on the table `evaluador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_usuario]` on the table `responsable_area` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "rol_t" AS ENUM ('ADMIN', 'COORDINADOR', 'RESPONSABLE', 'EVALUADOR', 'COMPETIDOR');

-- CreateEnum
CREATE TYPE "estado_usuario_t" AS ENUM ('ACTIVO', 'INACTIVO');

-- DropIndex
DROP INDEX "responsable_area_usuario_responsable_key";

-- AlterTable
ALTER TABLE "administrador" ADD COLUMN     "id_usuario" BIGINT;

-- AlterTable
ALTER TABLE "coordinador_area" ADD COLUMN     "id_usuario" BIGINT;

-- AlterTable
ALTER TABLE "evaluador" ADD COLUMN     "id_usuario" BIGINT;

-- AlterTable
ALTER TABLE "responsable_area" DROP COLUMN "pass_responsable",
DROP COLUMN "usuario_responsable",
ADD COLUMN     "id_usuario" BIGINT;

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "apellido" VARCHAR(150) NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "rol" "rol_t" NOT NULL,
    "estado" "estado_usuario_t" NOT NULL DEFAULT 'ACTIVO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "password_reset" (
    "id_reset" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "password_reset_pkey" PRIMARY KEY ("id_reset")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE INDEX "password_reset_userId_idx" ON "password_reset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "administrador_id_usuario_key" ON "administrador"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "coordinador_area_id_usuario_key" ON "coordinador_area"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "evaluador_id_usuario_key" ON "evaluador"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "responsable_area_id_usuario_key" ON "responsable_area"("id_usuario");

-- AddForeignKey
ALTER TABLE "password_reset" ADD CONSTRAINT "password_reset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrador" ADD CONSTRAINT "administrador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinador_area" ADD CONSTRAINT "coordinador_area_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluador" ADD CONSTRAINT "evaluador_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsable_area" ADD CONSTRAINT "responsable_area_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
