const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Routes
app.use('/', authRoutes);

app.listen(PORT, () => {
  console.log(`Servicio 1 (Usuarios) corriendo en el puerto ${PORT}`);
});
