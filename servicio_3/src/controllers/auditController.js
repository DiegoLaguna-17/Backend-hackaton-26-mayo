const supabase = require('../config/supabase');
const { logAudit } = require('../utils/audit');

exports.getAuditLogs = async (req, res) => {
  const performedBy = req.query.performed_by || req.headers['x-user-id'];
  const role = req.query.role || req.headers['x-user-role'];

  if (!performedBy || role !== 'AUDITOR') {
    return res.status(403).json({ error: 'Access Denied: Only users with the AUDITOR role can request access to logs.' });
  }

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    logAudit({
      action: 'AUDIT_ACCESS',
      performed_by: performedBy,
      role: 'AUDITOR',
      target_id: 'ALL_LOGS',
      details: 'Audit log reviewed by Ministry/Regulatory entity.',
      ip_address: req.ip
    });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
