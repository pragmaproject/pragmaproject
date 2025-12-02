/**
 * Utility functions
 */

/**
 * Converte BigInt e altri tipi non serializzabili in JSON in tipi serializzabili
 * @param {any} obj - Oggetto da serializzare
 * @returns {any} Oggetto serializzato
 */
function serializeBigInt(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = serializeBigInt(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

module.exports = {
  serializeBigInt
};
