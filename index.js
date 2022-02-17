const express = require('express');
const conectarDB = require('./config/db');
const cors = require('cors');

const app = express();

conectarDB();

const opcionesCors = {
  origin: process.env.FRONTEND_URL,
};
app.use(cors(opcionesCors));

const port = process.env.PORT || 4000;

app.use(express.json());

// habilitar carpeta pública
app.use(express.static('uploads'));

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/enlaces', require('./routes/enlaces'));
app.use('/api/archivos', require('./routes/archivos'));

app.listen(port, '0.0.0.0', () => {
  console.log(`server running on http://localhost:${port}`);
});
