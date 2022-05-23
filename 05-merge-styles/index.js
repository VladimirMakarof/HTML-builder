const path = require('path');
const { readdir } = require('fs/promises');
const { createReadStream, createWriteStream } = require('fs');

(async function() {
  try {
    const files = await readdir(path.join(__dirname, 'styles'), { withFileTypes: true });
    const output = createWriteStream(path.join(__dirname, 'project-dist', 'bundle.css'));

    for (const file of files) {
      const isCssFile = path.extname(file.name) === '.css';
      
      if (file.isFile() && isCssFile) {
        const input = createReadStream(path.join(__dirname, 'styles', file.name));      

        input.on('data', (chunk) => output.write(chunk));
        input.on('error', (err) => {
          throw new Error(err.message);
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
})();
