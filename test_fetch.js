const fs = require('fs');
fetch('http://localhost:5000/api/departments')
  .then(res => res.text().then(text => fs.writeFileSync('fetch_output.log', res.status + '\n' + text)))
  .catch(err => fs.writeFileSync('fetch_output.log', "FETCH ERROR: " + err));
