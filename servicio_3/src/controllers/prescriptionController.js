const supabase = require('../config/supabase');
const { logAudit } = require('../utils/audit');
const { generateDigitalSignature } = require('../utils/crypto');

exports.createPrescription = async (req, res) => {
  const { medical_record_id, patient_id, doctor_id, medications, pharmacy_id } = req.body;

  if (!patient_id || !doctor_id || !medications || !Array.isArray(medications)) {
    return res.status(400).json({ error: 'patient_id, doctor_id, and medications (array) are required fields.' });
  }

  try {
    const digital_signature = generateDigitalSignature(patient_id, doctor_id, medications);

    const { data, error } = await supabase
      .from('prescriptions')
      .insert([
        {
          medical_record_id,
          patient_id,
          doctor_id,
          medications,
          digital_signature,
          pharmacy_id,
          status: 'PENDING'
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    logAudit({
      action: 'CREATE_PRESCRIPTION',
      performed_by: doctor_id,
      role: 'DOCTOR',
      target_id: patient_id,
      details: `Issued digital prescription ${data.id} with digital signature: ${digital_signature.substring(0, 15)}...`,
      ip_address: req.ip
    });

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPatientPrescriptions = async (req, res) => {
  const { patientId } = req.params;
  const performedBy = req.query.performed_by || req.headers['x-user-id'] || 'UNKNOWN';
  const role = req.query.role || req.headers['x-user-role'] || 'UNKNOWN';

  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    logAudit({
      action: 'READ_PRESCRIPTIONS',
      performed_by: performedBy,
      role: role,
      target_id: patientId,
      details: `Retrieved ${data.length} prescriptions for patient.`,
      ip_address: req.ip
    });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.dispensePrescription = async (req, res) => {
  const { id } = req.params;
  const { pharmacy_id, performed_by } = req.body;

  if (!pharmacy_id) {
    return res.status(400).json({ error: 'pharmacy_id is required to dispense prescriptions.' });
  }

  try {
    const { data: prescription, error: getError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (getError) {
      if (getError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Prescription not found.' });
      }
      return res.status(500).json({ error: getError.message });
    }

    if (prescription.status !== 'PENDING') {
      return res.status(400).json({ error: `Prescription cannot be dispensed. Current status: ${prescription.status}` });
    }

    const { data: updatedPrescription, error: updateError } = await supabase
      .from('prescriptions')
      .update({ status: 'DISPENSED', pharmacy_id })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    logAudit({
      action: 'DISPENSE_PRESCRIPTION',
      performed_by: performed_by || pharmacy_id,
      role: 'PHARMACY',
      target_id: updatedPrescription.patient_id,
      details: `Dispensed prescription ${id} at pharmacy ${pharmacy_id}.`,
      ip_address: req.ip
    });

    return res.status(200).json(updatedPrescription);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
