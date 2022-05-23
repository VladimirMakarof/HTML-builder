const path = require('path');
const { stat } = require('fs');
const { readdir } = require('fs/promises');

(async function() {
  try {
    const files = await readdir(path.join(__dirname, 'secret-folder'), { withFileTypes: true });
    for (const file of files)
      stat(path.join(__dirname, 'secret-folder', file.name), (err, stats) => {
        if (err) {
          throw new Error(err.message);
        } else if (stats.isFile()) {
          const fileName = path.basename(file.name, path.extname(file.name));
          const fileExt = path.extname(file.name).slice(1);
          const BITE_PER_KB = 1024;
          const fileSizeInKb = stats.size / BITE_PER_KB;
          
          console.log(`${fileName} - ${fileExt} - ${fileSizeInKb}kb`);
        }
      });
  } catch (err) {
    console.error(err);
  }
})();
