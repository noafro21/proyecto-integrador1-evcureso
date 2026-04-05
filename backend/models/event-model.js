const mongoose = require("mongoose");

// ==========================================
// ESQUEMA DE EVENTO (Event Schema)
// ==========================================
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título del evento es obligatorio"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La descripción es obligatoria"],
    },
    eventDate: {
      type: Date,
      required: [true, "La fecha y hora del evento son obligatorias"],
    },
    // RNF-11: Estándar estricto GeoJSON para ubicación
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // Formato exacto: [longitud, latitud]
        required: true,
      },
      addressName: {
        // Nombre legible del lugar (Ej: Parque Central)
        type: String,
        required: true,
      },
    },
    categories: [
      {
        type: String,
        trim: true,
        // Ej: '#AireLibre', '#Cultura'
      },
    ],
    // RF-08: Diferenciación entre fuente oficial y comunitaria
    sourceType: {
      type: String,
      enum: ["Oficial", "Comunitaria"],
      required: true,
    },
    // RF-10: Sugerencias inician en "Por Verificar"
    status: {
      type: String,
      enum: ["Activo", "Pendiente de Verificación", "Cancelado"],
      default: "Activo",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String, // Texto porque guardaremos el enlace (URL) de la imagen
      required: false, // Ponlo en false si no todas las personas subirán imagen
    },
  },
  {
    timestamps: true,
  },
);

// ==========================================
// ÍNDICES GEOESPACIALES (RNF-01)
// ==========================================
// Este índice 2dsphere es CRUCIAL para que las búsquedas
// de "Eventos a 5km" se resuelvan en menos de 1.5 segundos.
eventSchema.index({ location: "2dsphere" });

// ==========================================
// MÉTODOS DEL MODELO (Lógica de Negocio)
// ==========================================
/*
 * RF-06: Validar que la cancelación ocurra con un tiempo mínimo
 * de 63 horas de antelación.
 */
eventSchema.methods.canBeCancelled = function () {
  const now = new Date();
  const eventTime = new Date(this.eventDate);

  // Diferencia en milisegundos
  const differenceInMs = eventTime - now;

  // Convertir a horas
  const differenceInHours = differenceInMs / (1000 * 60 * 60);

  // Retorna true si faltan MÁS de 63 horas
  return differenceInHours >= 63;
};
module.exports = mongoose.model("Event", eventSchema);
