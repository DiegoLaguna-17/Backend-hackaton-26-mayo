const crypto = require('crypto');

function generateDigitalSignature(patient_id, doctor_id, medications) {
  const salt = 'mediconnect-secret-key-2026';
  const payload = `${patient_id}:${doctor_id}:${JSON.stringify(medications)}:${Date.now()}`;
  return crypto
    .createHmac('sha256', salt)
    .update(payload)
    .digest('hex');
}

module.exports = { generateDigitalSignature };
