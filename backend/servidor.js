const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PUERTO = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Funciones para manejar el JSON como "base de datos"
const cargarDatos = () => {
    try {
        return JSON.parse(fs.readFileSync("datos.json"));
    } catch (error) {
        return { usuarios: [], voluntarios: [], adopciones: [], mensajes: [] };
    }
};

const guardarDatos = (datos) => {
    console.log("Guardando datos:", datos); // Verifica los datos antes de escribir en el archivo
    try {
        fs.writeFileSync("datos.json", JSON.stringify(datos, null, 2));
        console.log("Datos guardados correctamente.");
    } catch (error) {
        console.error("Error al guardar los datos:", error);
    }
};


// Ruta para registro
app.post("/registro", (req, res) => {
    // Destructura todos los datos recibidos desde el formulario
    const {
      nombre,
      apellidos,
      dni,
      email,
      password,
      repetir_password,
      fecha_nacimiento,
      rol
    } = req.body;
  
    console.log("Datos recibidos:", req.body);  // Verifica los datos recibidos
  
    let datos = cargarDatos();
  
    // Verifica si el correo ya está registrado
    if (datos.usuarios.find(usuario => usuario.email === email)) {
      return res.status(400).json({ mensaje: "Este correo ya está registrado" });
    }
  
    // Guarda todos los datos del usuario
    datos.usuarios.push({
      nombre,
      apellidos,
      dni,
      email,
      password,
      repetir_password,
      fecha_nacimiento,
      rol
    });
  
    // Guarda los datos en el archivo JSON
    guardarDatos(datos);
  
    // Responde con un mensaje de éxito
    res.json({ mensaje: "Registro exitoso" });
    
  });  


// Iniciar el servidor
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
