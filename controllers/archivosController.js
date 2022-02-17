const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlaces = require('../models/Enlace');

exports.subirArchivo = async (req, res, next) => {
  const configuracionMulter = {
    limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
    storage: (fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname + '/../uploads');
      },
      filename: (req, file, cb) => {
        // const extension = file.mimetype.split('/')[1];
        const extension = file.originalname.substring(
          file.originalname.lastIndexOf('.'),
          file.originalname.length
        );
        cb(null, `${shortid.generate()}${extension}`);
      },
      // fileFilter: (req, file, cb) => {
      //   if(file.mimetype === 'application/pdf') {
      //     return cb(null, true)
      //   }
      // }
    })),
  };

  const upload = multer(configuracionMulter).single('archivo');

  upload(req, res, async (error) => {
    if (req.file) {
      console.log(req.file);
      if (!error) {
        res.json({ archivo: req.file.filename });
      } else {
        console.log(error);
        return next();
      }
    } else {
      return res.json({ msg: 'No existe archivo' });
    }
  });
};

exports.eliminarArchivo = async (req, res) => {
  try {
    fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
    console.log('archivo eliminado');
  } catch (error) {
    console.log(error);
  }
};

// descarga un archivo
exports.descargar = async (req, res, next) => {
  // Obtiene el enlace
  const { archivo } = req.params;
  const enlace = await Enlaces.findOne({ nombre: archivo });
  if (!enlace) {
    return res.json({ msg: 'No existe enlace para este archivo' });
  }
  const archivoDescarga = __dirname + '/../uploads/' + archivo;
  if (!fs.existsSync(archivoDescarga)) {
    return res.json({ msg: 'El fichero no existe en file system' });
  }
  res.download(archivoDescarga);

  // eliminar el archivo y la entrada en la base de datos
  // si las descargas son iguales a 1 - Borrar la entrada y el archivo
  const { descargas, nombre } = enlace;
  if (descargas === 1) {
    // eliminar el archivo
    req.archivo = nombre;

    // eliminar la entrada de la BD
    await Enlaces.findOneAndRemove(enlace.id);
    next();
  } else {
    // En otro caso, restar 1 a descargas
    enlace.descargas--;
    await enlace.save();
  }
};
