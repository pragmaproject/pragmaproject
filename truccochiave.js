// Esegui questo in un terminale node
const crypto = require('crypto');
const key = "pk_live_" + crypto.randomBytes(24).toString('hex');
console.log(key);