// tbr-backend/logger.js
const { exec } = require('child_process');

const LOG_SSH_USER = process.env.LOG_SSH_USER || 'logger';
const LOG_SSH_HOST = process.env.LOG_SSH_HOST || '192.168.229.40';
const LOG_SSH_PATH = process.env.LOG_SSH_PATH || '/var/log/tbr/login.log';

// Mask email to avoid storing full PPI
function maskEmail(email) {
  return email.replace(/(.{2}).+(@.*)/, '$1***$2');
}

function logLoginEvent(email, success) {
  return new Promise((resolve, reject) => {
    const ts = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAIL';
    const safeEmail = maskEmail(email || 'unknown');

    const line = `${ts} LOGIN ${status} ${safeEmail}`;
    const cmd = `ssh ${LOG_SSH_USER}@${LOG_SSH_HOST} "echo '${line}' >> ${LOG_SSH_PATH}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('Failed to send login log:', error.message);
        return reject(error);
      }
      resolve();
    });
  });
}

module.exports = { logLoginEvent };
