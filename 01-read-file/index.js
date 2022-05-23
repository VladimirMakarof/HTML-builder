const fs = require('fs');
const path = require('path');
const { stdout } = require('process');
const input = fs.createReadStream(path.join(__dirname, 'text.txt'), 'utf-8');
input.on('data', data => stdout.write(data));
