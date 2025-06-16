// backend/utils/codeGenerator.js

async function generateUniqueCode(db, type = 'client') {
  let code;
  let existsInUsers = true;
  let existsInBrokers = true;
  let min, max;

  if (type === 'broker') {
    min = 900000;
    max = 999999;
  } else {
    min = 100000;
    max = 899999;
  }

  while (existsInUsers || existsInBrokers) {
    code = Math.floor(min + Math.random() * (max - min + 1)).toString();
    existsInUsers = await db.collection('users').findOne({ code });
    existsInBrokers = await db.collection('customs-brokers').findOne({ code: String(code) });
  }
  return code;
}

module.exports = generateUniqueCode;
