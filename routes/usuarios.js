const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { check } = require('express-validator');

router.post(
  '/',
  [check('nombre', 'MSU-01: El nombre es obligatorio').not().isEmpty()],
  [check('email', 'MSU-02: Un email válido es obligatorio').isEmail()],
  [
    check(
      'password',
      'MSU-03: El Password es obligatorio y debe tener al menos 6 caracteres'
    ).isLength({
      min: 6,
    }),
  ],
  usuarioController.nuevoUsuario
);

module.exports = router;
