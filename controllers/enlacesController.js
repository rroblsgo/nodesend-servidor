const Enlaces = require('../models/Enlace');
const shortid = require('shortid');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.nuevoEnlace = async (req, res) => {
  // revisar si hay errores
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  // crear un objeto enlace
  const { nombre_original, nombre } = req.body;
  const enlace = new Enlaces();
  enlace.url = shortid.generate();
  enlace.nombre = nombre;
  enlace.nombre_original = nombre_original;

  // si el usuario está autenticado
  if (req.usuario) {
    const { password, descargas } = req.body;

    // asignar a enlace el número de descargas
    if (descargas) {
      enlace.descargas = descargas;
    }
    // asignar un password
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      enlace.password = await bcryptjs.hash(password, salt);
    }
    // asignar el autor
    enlace.autor = req.usuario.id;
  }
  // almacenar enlace en la BD
  try {
    await enlace.save();
    return res.json({ msg: `${enlace.url}` });
    //next();
  } catch (error) {
    console.log(error);
  }
  // console.log(enlace);
};

// Obtener un listado de todos los enlaces
exports.todosEnlaces = async (req, res) => {
  try {
    const enlaces = await Enlaces.find({}).select('url -_id');
    res.json({ enlaces });
  } catch (error) {
    console.log(error);
  }
};

// Retorna si el enlace tiene o no password
exports.tienePassword = async (req, res) => {
  const { url } = req.params;

  // verificar si existe el enlace
  const enlace = await Enlaces.findOne({ url });
  if (!enlace) {
    return res.status(404).json({ msg: 'MSE-11: Ese enlace no existe' });
    //return next();
  }
  if (enlace.password) {
    return res.json({
      archivo: enlace.nombre,
      password: true,
      enlace: enlace.url,
    });
  } else {
    return res.json({
      archivo: enlace.nombre,
      password: false,
      enlace: enlace.url,
    });
  }
  //next();
};

// verifica si el password es correcto
exports.verificarPassword = async (req, res) => {
  const { url } = req.params;
  const { password } = req.body;

  // consultar por el enlace
  const enlace = await Enlaces.findOne({ url });
  if (!enlace) {
    return res.status(404).json({ msg: 'MSE-21: Ese enlace no existe' });
  }
  if (!enlace.password) {
    return res
      .status(404)
      .json({ msg: 'MSE-24: Ese enlace no tiene password' });
  }
  if (!password) {
    return res.status(404).json({ msg: 'MSE-23: Falta password' });
  }
  // verificar el password
  if (bcryptjs.compareSync(password, enlace.password)) {
    // permitirle al usuario descargar el archivo
    return res.json({
      archivo: enlace.nombre,
      password: true,
      enlace: enlace.url,
    });
  } else {
    return res.status(401).json({ msg: 'MSE-22: Password incorrecto' });
  }
};

// obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
  // verificar si existe el enlace
  const { url } = req.params;
  // console.log(url);

  const enlace = await Enlaces.findOne({ url });

  if (!enlace) {
    return res.status(404).json({ msg: 'MSE-12: Ese enlace no existe' });
    //return next();
  }

  // si el enlace existe
  res.json({ archivo: enlace.nombre, password: false, enlace: enlace.url });
  //next();
};
