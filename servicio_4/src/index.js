const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Servicio 4' });
});

app.listen(PORT, () => {
  console.log(`Servicio 4 corriendo en el puerto ${PORT}`);
});
