const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

// Inicializar express
const app = express(); // Asegúrate de que esto esté bien definido
const PORT = 3000;

// Configurar almacenamiento con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nombre único para cada archivo
  },
});

const upload = multer({ storage: storage });

// Middleware para procesar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir archivos estáticos (HTML y CSS)
app.use(express.static("public"));

// Ruta para manejar el envío del formulario
app.post(
  "/send",
  upload.fields([
    { name: "archivo", maxCount: 1 }, // Para el primer archivo
    { name: "foto", maxCount: 1 },    // Para el segundo archivo (foto)
  ]),
  async (req, res) => {
    const { nombre, email, cuit, telefono, opciones } = req.body; // Incluimos 'telefono'
    const archivo = req.files.archivo ? req.files.archivo[0] : null;
    const foto = req.files.foto ? req.files.foto[0] : null;

    // Configurar el transportador de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "subzerov39@gmail.com", 
        pass: "ncjn aaqk rctm vcep", 
      },
    });

    // Configurar el contenido del correo
    const mailOptions = {
      from: email,
      to: "subzerov39@gmail.com",
      subject: `Formulario enviado por ${nombre}`,
      text: `Nombre completo: ${nombre}
Correo electrónico: ${email}
CUIT: ${cuit}
Teléfono: ${telefono}
Opción seleccionada: ${opciones}`,
      attachments: [
        {
          filename: archivo ? archivo.originalname : "",
          path: archivo ? archivo.path : "",
        },
        {
          filename: foto ? foto.originalname : "",
          path: foto ? foto.path : "",
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Correo enviado correctamente");
    } catch (error) {
      console.error("Error enviando el correo: ", error);
      res.status(500).send("Error enviando el correo");
    }
  }
);
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});