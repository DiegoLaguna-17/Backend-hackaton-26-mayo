const express = require('express');

const router = express.Router();

const {
    listarCitas,
    obtenerCita,
    reprogramarCita,
    cancelarCita
} = require('../controllers/citas.controller');

/* LISTAR CITAS */
router.get('/', listarCitas);

/* OBTENER CITA */
router.get('/:id', obtenerCita);

/* REPROGRAMAR CITA */
router.put('/:id', reprogramarCita);

/* CANCELAR CITA */
router.delete('/:id', cancelarCita);

module.exports = router;