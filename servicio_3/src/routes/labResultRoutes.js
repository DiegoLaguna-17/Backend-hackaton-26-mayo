const express = require('express');
const router = express.Router();
const labResultController = require('../controllers/labResultController');

router.post('/', labResultController.createLabResult);
router.get('/patient/:patientId', labResultController.getPatientLabResults);

module.exports = router;
