require('dotenv').config();

const express = require('express');

const citasRoutes = require('./routes/citas.routes');

const app = express();

const PORT = process.env.PORT || 3002;

app.use(express.json());

/* HEALTH CHECK */
app.get('/api/health', (req, res) => {

  res.status(200).json({
    status: 'OK',
    servicio: 'Servicio de Citas'
  });

});

/* RUTAS API */
app.use('/api/citas', citasRoutes);

app.listen(PORT, () => {

  console.log(
    `Servicio corriendo en puerto ${PORT}`
  );

});