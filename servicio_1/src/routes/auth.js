const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registrar/paciente', authController.registrarPaciente);
router.post('/login', authController.login);
router.get('/health', authController.health);
router.post('/registrar/medico', authController.registrarMedico);

router.post('/agregar/rol', authController.agregarRol);

router.post('/registrar/farmacia',authController.registrarFarmacia)
router.post('/registrar/personal/farmacia',authController.registrarPersonalFarmacia)
router.post('/registrar/personal/salud',authController.registrarPersonalSalud)
router.post('/registrar/auditor',authController.registrarAuditor)

module.exports = router;
