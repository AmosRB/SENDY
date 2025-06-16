// backend/utils/codeGenerator.js
async function generateUniqueCode(db) {
  let code;
  let existsInUsers = true;
  let existsInBrokers = true;

  while (existsInUsers || existsInBrokers) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    // ודא שהבדיקה היא מול קולקציית המשתמשים
    existsInUsers = await db.collection('users').findOne({ code });
    // ודא שהבדיקה היא מול קולקציית עמילי המכס
    existsInBrokers = await db.collection('customs-brokers').findOne({ code: String(code) }); 
  }
  return code;
}

module.exports = generateUniqueCode;