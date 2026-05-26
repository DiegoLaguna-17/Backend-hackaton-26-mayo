const supabase = require('../config/supabase');
const { logAudit } = require('../utils/audit');

exports.createLabResult = async (req, res) => {
  const { patient_id, lab_name, test_name, result_data, test_date } = req.body;

  if (!patient_id || !lab_name || !test_name || !result_data || !test_date) {
    return res.status(400).json({ error: 'patient_id, lab_name, test_name, result_data, and test_date are all required.' });
  }

  try {
    const { data, error } = await supabase
      .from('lab_results')
      .insert([{ patient_id, lab_name, test_name, result_data, test_date }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    logAudit({
      action: 'RECEIVE_LAB_RESULTS',
      performed_by: lab_name,
      role: 'LABORATORY',
      target_id: patient_id,
      details: `Received laboratory results for test: ${test_name} from ${lab_name}.`,
      ip_address: req.ip
    });

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getPatientLabResults = async (req, res) => {
  const { patientId } = req.params;
  const performedBy = req.query.performed_by || req.headers['x-user-id'] || 'UNKNOWN';
  const role = req.query.role || req.headers['x-user-role'] || 'UNKNOWN';

  try {
    const { data, error } = await supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    logAudit({
      action: 'READ_LAB_RESULTS',
      performed_by: performedBy,
      role: role,
      target_id: patientId,
      details: `Retrieved ${data.length} laboratory test results.`,
      ip_address: req.ip
    });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
