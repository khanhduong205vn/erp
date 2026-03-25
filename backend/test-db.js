try {
  const mysql = require('mysql2/promise');
  const fs = require('fs');
  fs.writeFileSync('error.txt', 'mysql2 loaded OK');
} catch(e) {
  const fs = require('fs');
  fs.writeFileSync('error.txt', 'mysql2 LOAD ERROR: ' + e.message + '\n' + e.stack);
}
