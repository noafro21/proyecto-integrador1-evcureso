// Dependencias, son bibliotecas que se instalan para que el servidor pueda levantarse correctamente
const express = require("express"); // Facilita la creación de servidores y manejo de rutas
const mongoose = require("mongoose"); // Permite conectarse a la BD de mongoDB
const cors = require("cors"); // Permite la comunicación entre dominios diferentes
const bodyParser = require("body-parser"); // Permite interpretar los datos en formato JSON
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") }); // Se importa el archivo .env para poder utilizar sus variables

const app = express(); // Crear una instancia de express
const PORT = process.env.PORT || 3000; // Usar el puerto indicado en .env o el 3000

// Importacion de rutas
const userRoute = require("./routes/user-route");
const eventRoute = require("./routes/event-route");

// Middlewares
app.use(express.json()); // Habilita el manejo de JSON en las peticiones
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Habilita el análisis de JSON en las peticiones
app.use(cors());

// Fix para el error querySrv ECONNREFUSED en MongoDB Atlas
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

// Rutas de Evcureso
app.use("/usuarios", userRoute);
app.use("/eventos", eventRoute);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor de Evcureso en funcionamiento");
});

async function startServer() {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.info("MongoDB Atlas conectado para Evcureso");
    } else {
      console.warn(
        "MONGODB_URI no esta definida; el servidor arranco sin base de datos.",
      );
    }

    app.listen(PORT, () => {
      console.info("Servidor corriendo en http://localhost:" + PORT);
    });
  } catch (error) {
    console.error("Ocurrio un error al conectarse con MongoDB:", error);
    app.listen(PORT, () => {
      console.info("Servidor corriendo en http://localhost:" + PORT);
    });
  }
}

startServer();
