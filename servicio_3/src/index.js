require('dotenv').config();
const express = require('express');
const cors = require('cors');

const medicalRecordRoutes = require('./routes/medicalRecordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const labResultRoutes = require('./routes/labResultRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes Setup
app.use('/medical-records', medicalRecordRoutes);
app.use('/prescriptions', prescriptionRoutes);
app.use('/lab-results', labResultRoutes);
app.use('/audit-logs', auditRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'EHR and Audit Service (Servicio 3)' });
});

// Server Initialization
app.listen(PORT, () => {
  console.log(`EHR and Audit Service (Servicio 3) running on port ${PORT}`);
});
