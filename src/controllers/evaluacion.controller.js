// src/controllers/evaluacion.controller.js
import * as evaluacionService from "../services/evaluacion.service.js";

function ok(res, data, code = 200) {
  return res.status(code).json({ ok: true, data });
}

const norm = (s) =>
  (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

/* ============================================================
   GET /api/evaluaciones   (Listado de evaluaciones)
   ============================================================ */
export async function getResultadosClasificatoria(req, res, next) {
  try {
    const usr = req.user || {};
    const rol = norm(usr.rol ?? usr.role);
    const id_usuario = usr.id_usuario;

    const q = req.query || {};
    const { idFase, nivel, estado, search } = q;

    console.log("🟦[CTRL:getResultados] user:", usr);
    console.log("🟦[CTRL:getResultados] query:", q);

    let idEvaluador = usr?.id_evaluador ? Number(usr.id_evaluador) : null;

    if (!idEvaluador && q?.idEvaluador) {
      const n = Number(q.idEvaluador);
      if (Number.isFinite(n)) idEvaluador = n;
    }

    if (!idEvaluador) {
      try {
        idEvaluador = await evaluacionService.resolveIdEvaluadorByUsuario({
          rol, id_usuario
        });
      } catch (e) {
        console.log("🟨[CTRL:getResultados] resolveIdEvaluador error:", e?.message);
      }
    }

    console.log("🟦[CTRL:getResultados] rol:", rol, " -> idEvaluador:", idEvaluador);

    const data = await evaluacionService.findResultadosClasificatoria({
      idFase: idFase ?? null,
      idNivel: nivel ?? null,
      estado: estado ?? null,
      search: search ?? null,
      idEvaluador,
    });

    console.log("🟦[CTRL:getResultados] rows:", Array.isArray(data) ? data.length : "n/a");
    return ok(res, data, 200);

  } catch (err) {
    console.log("🟥[CTRL:getResultados] error:", err);
    next(err);
  }
}

/* ============================================================
   GET /api/evaluaciones/historial
   ============================================================ */
export async function getHistorialEvaluaciones(req, res, next) {
  try {
    const usr = req.user || {};
    const rol = norm(usr.rol ?? usr.role);
    const id_usuario = usr.id_usuario;
    const q = req.query || {};

    let idEvaluador = usr?.id_evaluador ? Number(usr.id_evaluador) : null;

    if (!idEvaluador && q?.idEvaluador) {
      const n = Number(q.idEvaluador);
      if (Number.isFinite(n)) idEvaluador = n;
    }

    if (!idEvaluador) {
      try {
        idEvaluador = await evaluacionService.resolveIdEvaluadorByUsuario({
          rol, id_usuario
        });
      } catch (e) {
        console.log("🟨[CTRL:getHistorial] resolveIdEvaluador error:", e?.message);
      }
    }

    console.log("🟦[CTRL:getHistorial] idEvaluador:", idEvaluador, " query:", q);

    const rows = await evaluacionService.getHistorialEvaluaciones({
      idEvaluador,
      search: q.search ?? null,
      from: q.from ?? null,
      to: q.to ?? null
    });

    console.log("🟦[CTRL:getHistorial] rows:", rows.length);

    // 🔎 Nombre mostrable: intenta con nombre+apellidos, luego username, email, y último fallback
    const nameParts = [
      (usr?.nombre ?? usr?.nombres ?? "").toString().trim(),
      (usr?.apellidos ?? usr?.apellido ?? "").toString().trim(),
    ].filter(Boolean);

    const displayUser =
      (nameParts.join(" ") || "").trim() ||
      (usr?.username ?? "").toString().trim() ||
      (usr?.email ?? "").toString().trim() ||
      (idEvaluador ? `Evaluador #${idEvaluador}` : "Evaluador");

    // 🔥 MAPEO A LAS COLUMNAS DEL FRONT
    const data = rows.map((r, idx) => ({
      id: r.id_auditoria ?? idx + 1,
      competidor: r.competidor ?? "",
      notaAnterior: r.campo === "nota" ? (r.anterior ?? "") : "",
      notaNueva:    r.campo === "nota" ? (r.nuevo ?? "")    : "",
      fecha: r.fecha
        ? new Date(r.fecha).toISOString().slice(0, 16).replace("T", " ")
        : "",
      usuario: displayUser,
    }));

    return ok(res, data, 200);

  } catch (err) {
    console.log("🟥[CTRL:getHistorial] error:", err);
    next(err);
  }
}

/* ============================================================
   PUT /api/evaluaciones   (actualización batch)
   ============================================================ */
export async function actualizarNotasBatch(req, res, next) {
  try {
    const usr = req.user || {};
    const rol = norm(usr.rol ?? usr.role);
    const id_usuario = usr.id_usuario;
    const q = req.query || {};

    let idEvaluador = usr?.id_evaluador ? Number(usr.id_evaluador) : null;

    if (!idEvaluador && q?.idEvaluador) {
      const n = Number(q.idEvaluador);
      if (Number.isFinite(n)) idEvaluador = n;
    }

    if (!idEvaluador) {
      try {
        idEvaluador = await evaluacionService.resolveIdEvaluadorByUsuario({ rol, id_usuario });
      } catch (e) {
        console.log("🟨[CTRL:putBatch] resolveIdEvaluador error:", e?.message);
      }
    }

    const cambios = Array.isArray(req.body) ? req.body : [];
    console.log("🟦[CTRL:putBatch] idEvaluador:", idEvaluador, " cambios:", cambios.length);

    const result = await evaluacionService.actualizarNotasBatch({
      idEvaluador,
      cambios,
      usuarioInfo: { id_usuario, rol },
    });

    return ok(res, result, 200);

  } catch (err) {
    console.log("🟥[CTRL:putBatch] error:", err);
    next(err);
  }
}

/* ============================================================
   PATCH /api/evaluaciones/:id
   ============================================================ */
export async function actualizarNotaIndividual(req, res, next) {
  try {
    const usr = req.user || {};
    const rol = norm(usr.rol ?? usr.role);
    const id_usuario = usr.id_usuario;

    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ ok: false, error: "id inválido" });
    }

    const q = req.query || {};
    const { nota, observacion } = req.body ?? {};

    let idEvaluador = usr?.id_evaluador ? Number(usr.id_evaluador) : null;

    if (!idEvaluador && q?.idEvaluador) {
      const n = Number(q.idEvaluador);
      if (Number.isFinite(n)) idEvaluador = n;
    }

    if (!idEvaluador) {
      try {
        idEvaluador = await evaluacionService.resolveIdEvaluadorByUsuario({
          rol, id_usuario
        });
      } catch (e) {
        console.log("🟨[CTRL:patchOne] resolveIdEvaluador error:", e?.message);
      }
    }

    console.log("🟦[CTRL:patchOne] idEvaluador:", idEvaluador, " id_evaluacion:", id, " body:", { nota, observacion });

    const result = await evaluacionService.actualizarNotaIndividual({
      idEvaluador,
      id_evaluacion: id,
      datos: { nota, observacion },
      usuarioInfo: { id_usuario, rol },
    });

    return ok(res, result, 200);

  } catch (err) {
    console.log("🟥[CTRL:patchOne] error:", err);
    next(err);
  }
}
