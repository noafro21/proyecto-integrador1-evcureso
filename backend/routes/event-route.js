const express = require("express");
const router = express.Router();
const Event = require("../models/event-model"); // Importar el modelo de evento
const User = require("../models/user-model"); // AGREGADO: Importar el modelo de usuario para verificar roles

// ==========================================
// POST: Crear un nuevo evento
// ==========================================
router.post("/crear", async (req, res) => {
  // AGREGADO: Extraemos imageUrl del cuerpo de la petición
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

  // Validación básica de campos obligatorios
  if (
    !title ||
    !description ||
    !eventDate ||
    !location ||
    !sourceType ||
    !creator
  ) {
    return res
      .status(400)
      .json({
        mensajeError: "Faltan campos obligatorios para crear el evento.",
      });
  }

  // Validar el formato GeoJSON de la ubicación
  if (!location.coordinates || !location.addressName) {
    return res
      .status(400)
      .json({
        mensajeError:
          "La ubicación debe incluir coordenadas [longitud, latitud] y el nombre del lugar.",
      });
  }

  try {
    // Determinar el estado inicial según el tipo de fuente en ESPAÑOL
    const status =
      sourceType === "Oficial" ? "Activo" : "Pendiente de Verificación";

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
      sourceType,
      status,
      creator,
      imageUrl, // AGREGADO: Pasamos la URL de la imagen al modelo
    });

    await nuevoEvento.save();
    res
      .status(201)
      .json({ mensaje: "Evento creado exitosamente", evento: nuevoEvento });
  } catch (error) {
    res.status(400).json({ mensajeError: error.message });
  }
});

/*
Ejemplo para probar en Postman (POST http://localhost:3000/eventos/crear):
{
  "title": "Concierto de Rock Local",
  "description": "Bandas locales tocando en vivo.",
  "eventDate": "2026-05-15T20:00:00.000Z",
  "location": {
    "coordinates": [-84.05, 9.93], 
    "addressName": "Plaza Principal"
  },
  "categories": ["#Cultura", "#Música"],
  "sourceType": "Oficial",
  "creator": "COLOCA_AQUI_UN_ID_DE_USUARIO_VALIDO",
  "imageUrl": "https://ejemplo.com/imagen.jpg"
}
*/

// ==========================================
// GET: Obtener todos los eventos (Activos)
// ==========================================
router.get("/", async (req, res) => {
  try {
    // Solo mostramos los eventos que están activos y aprobados
    const eventos = await Event.find({ status: "Activo" })
      // Utilizamos populate para cruzar datos, trayendo el nombre y correo de quien lo creó
      .populate("creator", "fullName email role");

    res.json(eventos);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

/*
Ejemplo para probar en Postman:
GET http://localhost:3000/eventos
*/

// ==========================================
// PUT: Cancelar un evento (Validación RF-06)
// ==========================================
router.put("/:id/cancelar", async (req, res) => {
  try {
    const eventoId = req.params.id;

    // 1. Buscamos el evento por su ID
    const evento = await Event.findById(eventoId);

    if (!evento) {
      return res.status(404).json({ mensajeError: "Evento no encontrado." });
    }

    if (evento.status === "Cancelado") {
      return res
        .status(400)
        .json({ mensajeError: "Este evento ya estaba cancelado." });
    }

    // 2. Usamos el método de validación de 63 horas creado en el modelo (RF-06)
    if (!evento.canBeCancelled()) {
      return res.status(400).json({
        mensajeError:
          "Regla 63 horas: No se puede cancelar el evento porque faltan menos de 63 horas para su inicio.",
      });
    }

    // 3. Si pasó la validación, lo cancelamos
    evento.status = "Cancelado";
    await evento.save();

    res.status(200).json({ mensaje: "Evento cancelado exitosamente.", evento });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

/*
Ejemplo para probar en Postman:
PUT http://localhost:3000/eventos/COLOCA_AQUI_EL_ID_DEL_EVENTO/cancelar
*/

// ==========================================
// GET: Buscar eventos cercanos (GeoJSON) a menos de X km
// ==========================================
router.get("/cercanos", async (req, res) => {
  // Obtenemos latitud, longitud y distancia máxima en km desde la URL
  const { lat, lng, km } = req.query;

  if (!lat || !lng || !km) {
    return res
      .status(400)
      .json({ mensajeError: "Debes proporcionar lat, lng y km en la URL." });
  }

  try {
    // MongoDB hace los cálculos geoespaciales en METROS
    const distanciaEnMetros = parseFloat(km) * 1000;

    // Buscar eventos ACTIVOS que estén dentro del radio especificado
    const eventosCercanos = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            // IMPORTANTE: MongoDB siempre usa el orden [Longitud, Latitud]
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: distanciaEnMetros,
        },
      },
      status: "Activo",
    }).populate("creator", "fullName email role");

    res.json(eventosCercanos);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

/*
Ejemplo para Postman (Buscando a 5km de San José):
GET http://localhost:3000/eventos/cercanos?lat=9.9333&lng=-84.0833&km=5
*/

// ==========================================
// PUT: Aprobar un evento comunitario (Solo Moderadores)
// ==========================================
router.put("/aprobar-comunitario", async (req, res) => {
  const { eventoId, moderadorId } = req.body;

  if (!eventoId || !moderadorId) {
    return res
      .status(400)
      .json({
        mensajeError: "El ID del evento y del moderador son obligatorios.",
      });
  }

  try {
    // 1. Verificar que la persona que intenta aprobar sea realmente un Moderador
    const moderador = await User.findById(moderadorId);

    if (!moderador) {
      return res
        .status(404)
        .json({ mensajeError: "Usuario moderador no encontrado." });
    }
    if (moderador.role !== "Moderador") {
      return res
        .status(403)
        .json({
          mensajeError:
            "Acceso denegado. Solo los Moderadores pueden aprobar eventos.",
        });
    }

    // 2. Buscar el evento que se quiere aprobar
    const evento = await Event.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ mensajeError: "Evento no encontrado." });
    }

    // 3. Validar que el evento realmente esté esperando aprobación
    if (evento.status !== "Pendiente de Verificación") {
      return res
        .status(400)
        .json({
          mensajeError: "Este evento no está pendiente de verificación.",
        });
    }

    // 4. Cambiar el estado a Activo
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

/*
Ejemplo para Postman:
PUT http://localhost:3000/eventos/aprobar-comunitario
{
  "eventoId": "ID_DEL_EVENTO_PENDIENTE",
  "moderadorId": "ID_DEL_USUARIO_MODERADOR"
}
*/

module.exports = router;
