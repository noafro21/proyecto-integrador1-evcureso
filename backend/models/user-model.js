const mongoose = require("mongoose");

// ==========================================
// ESQUEMA DE USUARIO (User Schema)
// ==========================================
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "El nombre completo es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },

    role: {
      type: String,
      enum: ["Explorador", "Promotor", "Moderador"],
      default: "Explorador", // Todo registro nuevo es Explorador por defecto
    },

    status: {
      type: String,
      enum: ["Activo", "Pendiente de Aprobar", "Inactivo"],
      default: "Activo",
    },

    discoveryPoints: {
      type: Number,
      default: 0,
    },

    savedEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // Añade automáticamente createdAt y updatedAt
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
