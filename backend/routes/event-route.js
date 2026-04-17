const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Event = require("../models/event-model"); // Importar el modelo de evento
const User = require("../models/user-model"); // Importar el modelo de usuario para verificar roles

// ==========================================
// 1. POST: Crear un nuevo evento
// ==========================================
router.post("/crear", async (req, res) => {
  const {
    title,
    description,
    eventDate,
    location,
    categories,
    sourceType,
    creator,
    imageUrl,
  } = req.body;

  if (
    !title ||
    !description ||
    !eventDate ||
    !location ||
    !sourceType ||
    !creator
  ) {
    return res.status(400).json({
      mensajeError: "Faltan campos obligatorios para crear el evento.",
    });
  }

  if (!location.coordinates || !location.addressName) {
    return res.status(400).json({
      mensajeError:
        "La ubicación debe incluir coordenadas [longitud, latitud] y el nombre del lugar.",
    });
  }

  try {
    // Traductor de seguridad por si el frontend envía los datos en inglés
    let tipoFuente = sourceType;
    if (tipoFuente === "Official") tipoFuente = "Oficial";
    if (tipoFuente === "Community") tipoFuente = "Comunitaria";

    // Determinar el estado inicial según el tipo de fuente
    const status =
      tipoFuente === "Oficial" ? "Activo" : "Pendiente de Verificación";

    const nuevoEvento = new Event({
      title,
      description,
      eventDate,
      location: {
        type: "Point",
        coordinates: location.coordinates,
        addressName: location.addressName,
      },
      categories: categories || [],
      sourceType: tipoFuente,
      status,
      creator,
      imageUrl,
    });

    await nuevoEvento.save();
    res
      .status(201)
      .json({ mensaje: "Evento creado exitosamente", evento: nuevoEvento });
  } catch (error) {
    res.status(400).json({ mensajeError: error.message });
  }
});

// ==========================================
// 2. GET: Obtener todos los eventos (Activos)
// ==========================================
router.get("/", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        mensajeError: "La base de datos todavía no está lista.",
      });
    }

    // Solo mostramos los eventos que están activos y aprobados
    const eventos = await Event.find({ status: "Activo" })
      // Utilizamos populate para cruzar datos, trayendo el nombre y correo de quien lo creó
      .populate("creator", "fullName email role");

    res.json(eventos);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

// ==========================================
// GET: Obtener eventos pendientes de verificación
// (DEBE IR AQUÍ, ANTES DEL /:id)
// ==========================================
router.get("/pendientes", async (req, res) => {
  try {
    const eventos = await Event.find({
      status: "Pendiente de Verificación",
    }).populate("creator", "fullName");
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

// ==========================================
// PUT: Cancelar un evento (Validación RF-06)
// ==========================================
// 5. PUT: Aprobar un evento comunitario (Solo Moderadores)
// (Esta ruta DEBE estar antes que /:id)
// ==========================================
router.put("/aprobar-comunitario", async (req, res) => {
  const { eventoId, moderadorId } = req.body;

  if (!eventoId || !moderadorId) {
    return res.status(400).json({
      mensajeError: "El ID del evento y del moderador son obligatorios.",
    });
  }

  try {
    const moderador = await User.findById(moderadorId);

    if (!moderador) {
      return res
        .status(404)
        .json({ mensajeError: "Usuario moderador no encontrado." });
    }
    if (moderador.role !== "Moderador") {
      return res.status(403).json({
        mensajeError:
          "Acceso denegado. Solo los Moderadores pueden aprobar eventos.",
      });
    }

    const evento = await Event.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ mensajeError: "Evento no encontrado." });
    }

    if (evento.status !== "Pendiente de Verificación") {
      return res.status(400).json({
        mensajeError: "Este evento no está pendiente de verificación.",
      });
    }

    evento.status = "Activo";
    await evento.save();

    res.status(200).json({
      mensaje: "¡Evento comunitario aprobado! Ahora es visible para todos.",
      evento,
    });
  } catch (error) {
    res.status(400).json({ mensajeError: error.message });
  }
});

// ==========================================
// 6. DELETE: Rechazar evento comunitario pendiente (solo moderador)
// ==========================================
router.delete("/:id/rechazar-comunitario", async (req, res) => {
  try {
    const { moderadorId } = req.body;
    const eventoId = req.params.id;

    if (!moderadorId) {
      return res
        .status(400)
        .json({ mensajeError: "El ID del moderador es obligatorio." });
    }

    const moderador = await User.findById(moderadorId);
    if (!moderador) {
      return res
        .status(404)
        .json({ mensajeError: "Usuario moderador no encontrado." });
    }

    if (moderador.role !== "Moderador") {
      return res.status(403).json({
        mensajeError:
          "Acceso denegado. Solo los Moderadores pueden rechazar eventos comunitarios.",
      });
    }

    const evento = await Event.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ mensajeError: "Evento no encontrado." });
    }

    if (evento.status !== "Pendiente de Verificación") {
      return res.status(400).json({
        mensajeError:
          "Solo se pueden rechazar eventos con estado Pendiente de Verificación.",
      });
    }

    await Event.findByIdAndDelete(eventoId);

    res.status(200).json({
      mensaje: "Evento comunitario rechazado y eliminado correctamente.",
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

// ==========================================
// 7. GET: Eventos gestionables por moderador
// Incluye eventos vencidos y los creados por el moderador
// ==========================================
router.get("/moderador/:moderadorId/gestion", async (req, res) => {
  try {
    const { moderadorId } = req.params;

    const moderador = await User.findById(moderadorId);
    if (!moderador) {
      return res
        .status(404)
        .json({ mensajeError: "Usuario moderador no encontrado." });
    }

    if (moderador.role !== "Moderador") {
      return res.status(403).json({
        mensajeError:
          "Acceso denegado. Solo los Moderadores pueden gestionar eventos.",
      });
    }

    const now = new Date();

    const eventos = await Event.find({
      $or: [{ eventDate: { $lt: now } }, { creator: moderadorId }],
    })
      .populate("creator", "fullName email role")
      .sort({ eventDate: 1 });

    const eventosGestion = eventos.map((evento) => {
      const esVencido = new Date(evento.eventDate) < now;
      const esPropio =
        evento.creator && evento.creator._id.equals(moderador._id);

      return {
        ...evento.toObject(),
        esVencido,
        esPropio,
      };
    });

    res.status(200).json(eventosGestion);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

// ==========================================
// 6. PUT: Cancelar un evento (Validación RF-06)
// (Esta ruta dinámica VA AL FINAL)
// ==========================================
router.put("/:id/cancelar", async (req, res) => {
  try {
    const eventoId = req.params.id;
    const evento = await Event.findById(eventoId);

    if (!evento) {
      return res.status(404).json({ mensajeError: "Evento no encontrado." });
    }

    if (evento.status === "Cancelado") {
      return res
        .status(400)
        .json({ mensajeError: "Este evento ya estaba cancelado." });
    }

    if (!evento.canBeCancelled()) {
      return res.status(400).json({
        mensajeError:
          "Regla 63 horas: No se puede cancelar el evento porque faltan menos de 63 horas para su inicio.",
      });
    }

    evento.status = "Cancelado";
    await evento.save();

    res.status(200).json({ mensaje: "Evento cancelado exitosamente.", evento });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

// ==========================================
// 8. DELETE: Eliminar un evento (moderador)
// Regla: puede eliminar si está vencido o si es de su autoría
// ==========================================
router.delete("/:id/eliminar", async (req, res) => {
  try {
    const { moderadorId } = req.body;
    const eventoId = req.params.id;

    if (!moderadorId) {
      return res
        .status(400)
        .json({ mensajeError: "El ID del moderador es obligatorio." });
    }

    const moderador = await User.findById(moderadorId);
    if (!moderador) {
      return res
        .status(404)
        .json({ mensajeError: "Usuario moderador no encontrado." });
    }

    if (moderador.role !== "Moderador") {
      return res.status(403).json({
        mensajeError:
          "Acceso denegado. Solo los Moderadores pueden eliminar eventos.",
      });
    }

    const evento = await Event.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ mensajeError: "Evento no encontrado." });
    }

    const esVencido = new Date(evento.eventDate) < new Date();
    const esPropio = evento.creator && evento.creator.equals(moderador._id);

    if (!esVencido && !esPropio) {
      return res.status(403).json({
        mensajeError:
          "Solo puedes eliminar eventos vencidos o eventos creados por ti.",
      });
    }

    const eventoEliminado = await Event.findByIdAndDelete(eventoId);

    if (!eventoEliminado) {
      return res.status(404).json({ mensajeError: "Evento no encontrado." });
    }

    res.status(200).json({
      mensaje: "Evento eliminado permanentemente.",
      evento: eventoEliminado,
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

// ==========================================
// 9. DELETE: Eliminar todos los eventos vencidos (moderador)
// ==========================================
router.delete("/moderador/:moderadorId/vencidos", async (req, res) => {
  try {
    const { moderadorId } = req.params;

    const moderador = await User.findById(moderadorId);
    if (!moderador) {
      return res
        .status(404)
        .json({ mensajeError: "Usuario moderador no encontrado." });
    }

    if (moderador.role !== "Moderador") {
      return res.status(403).json({
        mensajeError:
          "Acceso denegado. Solo los Moderadores pueden eliminar eventos vencidos.",
      });
    }

    const now = new Date();
    const resultado = await Event.deleteMany({ eventDate: { $lt: now } });

    res.status(200).json({
      mensaje: "Eventos vencidos eliminados correctamente.",
      eliminados: resultado.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

module.exports = router;
