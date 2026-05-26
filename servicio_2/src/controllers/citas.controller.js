const supabase = require('../config/supabase');

/* LISTAR CITAS */
const listarCitas = async (req, res) => {

    try {

        const { data, error } = await supabase
        .from('citas')
        .select('*');

        if (error) {
        throw error;
        }

        res.status(200).json(data);

    } catch (error) {

        res.status(500).json({
        mensaje: 'Error al listar citas',
        error: error.message
        });

    }

    };

    /* OBTENER CITA POR ID */
    const obtenerCita = async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase
        .from('citas')
        .select('*')
        .eq('id', id)
        .single();

        if (error) {
        throw error;
        }

        res.status(200).json(data);

    } catch (error) {

        res.status(500).json({
        mensaje: 'Error obteniendo cita',
        error: error.message
        });

    }

    };

    /* REPROGRAMAR CITA */
    const reprogramarCita = async (req, res) => {

    try {

        const { id } = req.params;

        const {
        fecha_cita,
        hora_cita
        } = req.body;

        const { data, error } = await supabase
        .from('citas')
        .update({
            fecha_cita,
            hora_cita,
            fecha_actualizacion: new Date()
        })
        .eq('id', id)
        .select();

        if (error) {
        throw error;
        }

        res.status(200).json({
        mensaje: 'Cita reprogramada correctamente',
        data
        });

    } catch (error) {

        res.status(500).json({
        mensaje: 'Error reprogramando cita',
        error: error.message
        });

    }

    };

    /* CANCELAR CITA */
    const cancelarCita = async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabase
        .from('citas')
        .update({
            estado: 'CANCELADA',
            fecha_actualizacion: new Date()
        })
        .eq('id', id)
        .select();

        if (error) {
        throw error;
        }

        res.status(200).json({
        mensaje: 'Cita cancelada correctamente',
        data
        });

    } catch (error) {

        res.status(500).json({
        mensaje: 'Error cancelando cita',
        error: error.message
        });

    }

};

module.exports = {
    listarCitas,
    obtenerCita,
    reprogramarCita,
    cancelarCita
};