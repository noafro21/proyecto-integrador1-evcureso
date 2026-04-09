const express = require("express");
const router = express.Router(); // Crear la señal
const User = require("../models/user-model"); // Importar el modelo de usuario
const Event = require("../models/event-model"); // Importar el modelo de evento

// ==========================================
// POST: Crear/registrar una nueva cuenta
// ==========================================
router.post("/register", async (req, res) => {
  const { fullName, email, password, isPromoter } = req.body;

  // Validación básica
  if (!fullName || !email || !password) {
    return res.status(400).json({
      mensajeError: "El nombre, correo y contraseña son obligatorios",
    });
  }

  try {
    // 1. Verificar si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ mensajeError: "Este correo electrónico ya está registrado." });
    }

    // 2. Determinar rol y estado según lo que solicitó (RF-01 y RF-02)
    let role = "Explorador";
    let status = "Activo";

    if (isPromoter) {
      role = "Promotor";
      status = "Pendiente de Aprobar"; // Requiere aprobación de un moderador
    }

    // 3. Crear el nuevo usuario
    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      password,
      role,
      status,
    });

    // 4. Guardar en la BD
    await newUser.save();
    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      usuario: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    res.status(400).json({ mensajeError: error.message });
  }
});

/*
Ejemplo para probar en Postman:
POST http://localhost:3000/usuarios/register
{
  "fullName": "Ana López",
  "email": "ana@test.com",
  "password": "123",
  "isPromoter": false
}
*/

// ==========================================
// POST: Iniciar sesión (Login)
// ==========================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ mensajeError: "Correo y contraseña son obligatorios" });
  }

  try {
    // 1. Buscar al usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ mensajeError: "Usuario no encontrado." });
    }

    // 2. Verificar contraseña (Texto plano según minuta)
    if (user.password !== password) {
      return res.status(401).json({ mensajeError: "Contraseña incorrecta." });
    }

    // 3. Validar si es un Promotor esperando aprobación (RF-02)
    if (user.role === "Promotor" && user.status === "Pendiente de Aprobar") {
      return res.status(403).json({
        mensajeError:
          "Tu cuenta de Promotor ha sido registrada, pero aún está pendiente de aprobación por un Moderador.",
      });
    }

    // 4. Inicio de sesión exitoso
    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

/*
Ejemplo para probar en Postman:
POST http://localhost:3000/usuarios/login
{
  "email": "ana@test.com",
  "password": "123"
}
*/

// ==========================================
// GET: Solicitar los datos de los usuarios a la BD
// ==========================================
router.get("/", async (req, res) => {
  try {
    const usuarios = await User.find().select("-password");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
Ejemplo para probar en Postman:
GET http://localhost:3000/usuarios
*/

// ==========================================
// GET: Obtener todos los Promotores "Pendientes de Aprobar"
// ==========================================
router.get("/pendientes", async (req, res) => {
  try {
    // Buscamos a todos los que tengan este estado específico
    const pendientes = await User.find({
      status: "Pendiente de Aprobar",
    }).select("-password");
    res.status(200).json(pendientes);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

// ==========================================
// PUT: Agregar un evento a "Mi Plan para el Finde"
// ==========================================
router.put("/agregar-plan", async (req, res) => {
  const { email, eventoId } = req.body;

  if (!email || !eventoId) {
    return res
      .status(400)
      .json({ mensajeError: "El correo y el ID del evento son obligatorios" });
  }

  try {
    // 1. Verificar que el evento realmente existe
    const evento = await Event.findById(eventoId);
    if (!evento) {
      return res.status(404).json({ mensajeError: "Evento no encontrado." });
    }

    // 2. Buscar al usuario
    const usuario = await User.findOne({ email: email.toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ mensajeError: "Usuario no encontrado." });
    }
    if (!usuario.savedEvents.includes(eventoId)) {
      usuario.savedEvents.push(eventoId);
      await usuario.save();
    }

    res
      .status(200)
      .json({ mensaje: "¡Evento agregado a tu Plan para el Finde!", usuario });
  } catch (error) {
    res.status(400).json({ mensajeError: error.message });
  }
});

/*
Ejemplo para Postman:
PUT http://localhost:3000/usuarios/agregar-plan
{
  "email": "ana@test.com",
  "eventoId": "ID_DEL_EVENTO_AQUI"
}
*/

// ==========================================
// PUT: Quitar un evento de "Mi Plan para el Finde" (NUEVO)
// ==========================================
router.put("/quitar-plan", async (req, res) => {
  const { email, eventoId } = req.body;

  if (!email || !eventoId) {
    return res
      .status(400)
      .json({ mensajeError: "El correo y el ID del evento son obligatorios" });
  }

  try {
    const usuario = await User.findOne({ email: email.toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ mensajeError: "Usuario no encontrado." });
    }
    usuario.savedEvents = usuario.savedEvents.filter(
      (id) => id.toString() !== eventoId,
    );
    await usuario.save();

    res.status(200).json({ mensaje: "Evento removido de tu plan.", usuario });
  } catch (error) {
    res.status(400).json({ mensajeError: error.message });
  }
});

// ==========================================
// PUT: Aprobar a un Promotor (Cambiar a Activo)
// ==========================================
router.put("/:id/aprobar", async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const usuario = await User.findById(usuarioId);

    if (!usuario) {
      return res.status(404).json({ mensajeError: "Usuario no encontrado" });
    }

    usuario.status = "Activo";
    await usuario.save();

    res
      .status(200)
      .json({ mensaje: "Promotor aprobado exitosamente", usuario });
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

// ==========================================
// GET: Obtener "Mi Plan para el Finde" de un usuario
// ==========================================
router.get("/:id/eventos-guardados", async (req, res) => {
  try {
    const usuarioId = req.params.id;

    // Buscamos al usuario y usamos .populate() para traer los datos completos del evento (título, fecha, imagen)
    const usuario = await User.findById(usuarioId).populate("savedEvents");

    if (!usuario) {
      return res.status(404).json({ mensajeError: "Usuario no encontrado" });
    }
    res.status(200).json(usuario.savedEvents);
  } catch (error) {
    res.status(500).json({ mensajeError: error.message });
  }
});

module.exports = router;
