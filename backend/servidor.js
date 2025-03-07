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

// Ruta para el formulario de voluntariado
app.post("/voluntariado", (req, res) => {
  const { nombre, apellidos, telefono, email, dias_disponibles, horario, experiencia, habilidades, area_interes, otro_interes, motivo } = req.body;

  console.log("Datos recibidos:", req.body); // Para depuración

  let datos = cargarDatos();

  // Guarda los datos del voluntario en la base de datos (archivo JSON)
  datos.voluntarios.push({
    nombre,
    apellidos,
    telefono,
    email,
    dias_disponibles,
    horario,
    experiencia,
    habilidades,
    area_interes,
    otro_interes,
    motivo,
    fecha_registro: new Date().toISOString() // Guarda la fecha de envío
  });

  guardarDatos(datos);

  res.json({ mensaje: "Solicitud de voluntariado enviada correctamente. Nos pondremos en contacto contigo." });
});

const router = express.Router();

// Endpoint para procesar solicitudes de adopción
// Ruta para solicitud de adopción
app.post("/adoptar", (req, res) => {
  try {
    const {
      // Información del peludito
      tipo_animal,
      nombre_peludo,
      genero_animal,

      // Información personal
      nombre,
      apellidos,
      telefono,
      email,

      // Dirección del adoptante
      calle,
      numero,
      ciudad,
      provincia,
      codigo_postal,

      // Entorno del adoptante
      tipo_vivienda,
      personas_hogar,
      acuerdo_adopcion,

      // Preguntas abiertas
      experiencia,
      entorno,
      cuidado,

      // Compromiso de adopción
      responsabilidad
    } = req.body;

    console.log("Datos recibidos para adopción:", req.body); // Depuración

    // Validación básica de campos obligatorios
    if (!tipo_animal || !nombre_peludo || !genero_animal ||
        !nombre || !apellidos || !telefono || !email ||
        !calle || !numero || !ciudad || !provincia || !codigo_postal ||
        !tipo_vivienda || !personas_hogar || !acuerdo_adopcion ||
        !experiencia || !responsabilidad) {
      return res.status(400).json({ mensaje: "Todos los campos obligatorios deben ser completados." });
    }

    // Cargar la base de datos
    let datos = cargarDatos();

    // Crear la nueva solicitud de adopción
    const nuevaSolicitud = {
      tipo_animal,
      nombre_peludo,
      genero_animal,
      nombre,
      apellidos,
      telefono,
      email,
      direccion: `${calle} ${numero}, ${ciudad}, ${provincia} - ${codigo_postal}`,
      tipo_vivienda,
      personas_hogar,
      acuerdo_adopcion,
      experiencia,
      entorno,
      cuidado,
      compromiso_cuidados: responsabilidad, // Renombrado para mantener compatibilidad con la estructura de datos existente
      fecha_solicitud: new Date().toISOString(),
    };

    // Guardar la solicitud en la base de datos (archivo JSON)
    datos.adopciones.push(nuevaSolicitud);
    guardarDatos(datos);

    console.log("Solicitud de adopción guardada correctamente:", nuevaSolicitud);

    return res.status(201).json({ mensaje: "Solicitud de adopción enviada correctamente." });
  } catch (error) {
    console.error("Error al procesar la solicitud de adopción:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
});

module.exports = router;


// Iniciar el servidor
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});
