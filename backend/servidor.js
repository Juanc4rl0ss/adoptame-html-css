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

// Ruta para registro
app.post("/contacto", (req, res) => {
  // Destructura todos los datos recibidos desde el formulario
  const {
    nombre,
    email,
    asunto,
    terminos,
  } = req.body;

  console.log("Datos recibidos:", req.body);  // Verifica los datos recibidos

  let datos = cargarDatos();

  // Guarda todos los datos del usuario
  datos.mensajes.push({
    nombre,
    email,
    asunto,
    terminos
  });

  // Guarda los datos en el archivo JSON
  guardarDatos(datos);

  // Responde con un mensaje de éxito
  res.json({ mensaje: "Se ha enviado la solicitud correctamente" });

});
// Ruta para iniciar sesión
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Intento de inicio de sesión:", req.body);

    let datos = cargarDatos();
    const usuario = datos.usuarios.find(user => user.email === email);

    if (!usuario) {
      return res.status(400).json({ mensaje: "Correo no registrado" });
    }

    // Verifica si la contraseña es correcta
    if (usuario.password !== password) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    res.json({ mensaje: "Inicio de sesión exitoso", usuario });
  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});


// Iniciar el servidor
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
