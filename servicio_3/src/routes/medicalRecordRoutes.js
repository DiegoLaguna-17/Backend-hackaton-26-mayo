const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');

router.post('/', medicalRecordController.createRecord);
router.get('/patient/:patientId', medicalRecordController.getPatientHistory);
router.get('/:id', medicalRecordController.getRecordById);

module.exports = router;
