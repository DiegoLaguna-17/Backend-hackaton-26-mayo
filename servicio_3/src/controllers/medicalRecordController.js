const supabase = require('../config/supabase');
const { logAudit } = require('../utils/audit');

exports.createRecord = async (req, res) => {
  const { patient_id, doctor_id, diagnosis, symptoms, treatment } = req.body;

  if (!patient_id || !doctor_id || !diagnosis) {
    return res.status(400).json({ error: 'patient_id, doctor_id, and diagnosis are required fields.' });
  }

  try {
    const { data, error } = await supabase
      .from('medical_records')
      .insert([{ patient_id, doctor_id, diagnosis, symptoms, treatment }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    logAudit({
      action: 'CREATE_RECORD',
      performed_by: doctor_id,
      role: 'DOCTOR',
      target_id: patient_id,
      details: `Created medical record ${data.id}. Diagnosis summary: ${diagnosis.substring(0, 100)}`,
      ip_address: req.ip
    });

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPatientHistory = async (req, res) => {
  const { patientId } = req.params;
  const performedBy = req.query.performed_by || req.headers['x-user-id'] || 'UNKNOWN';
  const role = req.query.role || req.headers['x-user-role'] || 'UNKNOWN';

  try {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    logAudit({
      action: 'READ_HISTORY',
      performed_by: performedBy,
      role: role,
      target_id: patientId,
      details: `Retrieved complete clinical history. Found ${data.length} records.`,
      ip_address: req.ip
    });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getRecordById = async (req, res) => {
  const { id } = req.params;
  const performedBy = req.query.performed_by || req.headers['x-user-id'] || 'UNKNOWN';
  const role = req.query.role || req.headers['x-user-role'] || 'UNKNOWN';

  try {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Medical record not found.' });
      }
      return res.status(500).json({ error: error.message });
    }

    logAudit({
      action: 'READ_RECORD',
      performed_by: performedBy,
      role: role,
      target_id: data.patient_id,
      details: `Retrieved medical record ID: ${id}`,
      ip_address: req.ip
    });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
