const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'Servicio 3' });
});

app.listen(PORT, () => {
  console.log(`Servicio 3 corriendo en el puerto ${PORT}`);
});
