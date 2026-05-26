const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Servicio 2' });
});

app.listen(PORT, () => {
  console.log(`Servicio 2 corriendo en el puerto ${PORT}`);
});
