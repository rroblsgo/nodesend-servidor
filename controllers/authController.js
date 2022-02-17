const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config({ path: 'variables.env' });

exports.autenticarUsuario = async (req, res) => {
  // mostrar mensajes de error de express-validator
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  // buscar el usuario para ver si está registrado
  const { email, password } = req.body;
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    return res.status(401).json({ msg: 'MSUA-11: El email no existe' });
    //return next();
  }
  // Verificar el password y autenticar el usuario
  if (bcryptjs.compareSync(password, usuario.password)) {
    // generar JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
      process.env.SECRETA,
      {
        expiresIn: '8h',
      }
    );
    res.json({ token });
  } else {
    return res.status(401).json({ msg: 'MSUA-12: Password incorrecto' });
    //return next();
  }
};

exports.usuarioAutenticado = async (req, res) => {
  res.json({ usuario: req.usuario });
};
