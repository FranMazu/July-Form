const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000; // Puerto dinámico para Heroku

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public")); // Carpeta para HTML, CSS y JS estáticos

// Ruta para manejar el formulario
app.post(
  "/send",
  upload.fields([
    { name: "archivo", maxCount: 1 }, // Primer archivo
    { name: "foto", maxCount: 1 },    // Segundo archivo
  ]),
  async (req, res) => {
    const { nombre, email, cuit, telefono, opciones } = req.body;
    const archivo = req.files.archivo ? req.files.archivo[0] : null;
    const foto = req.files.foto ? req.files.foto[0] : null;

    // Configuración de Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "subzerov39@gmail.com", 
        pass: "ncjn aaqk rctm vcep", 
      },
    });

    const mailOptions = {
      from: email,
      to: "TU_EMAIL@gmail.com", // Cambia esto por el correo receptor
      subject: `Formulario enviado por ${nombre}`,
      text: `Nombre: ${nombre}\nCorreo: ${email}\nCUIT: ${cuit}\nTeléfono: ${telefono}\nOpción: ${opciones}`,
      attachments: [
        ...(archivo ? [{ filename: archivo.originalname, path: archivo.path }] : []),
        ...(foto ? [{ filename: foto.originalname, path: foto.path }] : []),
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Correo enviado correctamente.");
    } catch (error) {
      console.error("Error enviando correo:", error);
      res.status(500).send("Error enviando el correo.");
    }
  }
);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});