const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

router.post(
  '/',
  [
    check('email', 'MSUA-01: Agrega un email válido').isEmail(),
    check('password', 'MSUA-02: El password no debe ir vacío').not().isEmpty(),
  ],
  authController.autenticarUsuario
);

router.get('/', auth, authController.usuarioAutenticado);

module.exports = router;
