const express = require('express');

const router = express.Router();

const {
    registrarCita,
    listarCitas,
    obtenerCita,
    reprogramarCita,
    cancelarCita,
    puntuarCita
} = require('../controllers/citas.controller');

/* REGISTRAR CITA */
router.post('/', registrarCita);

/* LISTAR CITAS */
router.get('/', listarCitas);

/* OBTENER CITA */
router.get('/:id', obtenerCita);

/* REPROGRAMAR CITA */
router.put('/:id', reprogramarCita);

/* CANCELAR CITA */
router.delete('/:id', cancelarCita);

/* PUNTUAR CITA */
router.put('/:id/puntuar', puntuarCita);

module.exports = router;