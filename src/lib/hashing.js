const crypto = require("crypto");

/**
 * Calcola l'hash SHA256 di un Buffer e restituisce l'hex senza 0x
 * @param {Buffer} buffer
 * @returns {string} hash esadecimale
 */
function hashBufferSHA256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

module.exports = {
  hashBufferSHA256
};
