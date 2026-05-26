const supabase = require('../config/supabase');

async function logAudit({ action, performed_by, role, target_id, details, ip_address }) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          action,
          performed_by: performed_by || 'SYSTEM',
          role: role || 'SYSTEM',
          target_id: String(target_id || ''),
          details,
          ip_address
        }
      ]);
    if (error) {
      console.error('Error writing to audit_logs:', error.message);
    }
  } catch (err) {
    console.error('Exception while logging audit:', err.message);
  }
}

module.exports = { logAudit };
