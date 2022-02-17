const Usuario = require('../models/Usuario');
const bcryptjs = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.nuevoUsuario = async (req, res) => {
  // mostrar mensajes de error de express-validator
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  // Verificar si el usuario está registrado
  const { email, password } = req.body;
  let usuario = await Usuario.findOne({ email });

  if (usuario) {
    return res
      .status(400)
      .json({ msg: 'MSU-20: No puede crearse. Usuario ya registrado' });
  }

  // crear nuevo usuario
  usuario = await new Usuario(req.body);

  //hashear el password
  const salt = await bcryptjs.genSalt(10);
  usuario.password = await bcryptjs.hash(password, salt);

  try {
    await usuario.save();
    res.json({ msg: 'MSU-10: Usuario creado correctamente' });
  } catch (error) {
    console.log(error);
  }
};
