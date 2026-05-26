const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');

router.post('/', prescriptionController.createPrescription);
router.get('/patient/:patientId', prescriptionController.getPatientPrescriptions);
router.put('/:id/dispense', prescriptionController.dispensePrescription);

module.exports = router;
