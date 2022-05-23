const { mkdir, readdir, copyFile, unlink } = require('fs/promises');
const path = require('path');

(async function() {
  try {
    await mkdir(path.join(__dirname, 'files-copy'), { recursive: true });

    const files = await readdir(path.join(__dirname, 'files'));
    const filesCopy = await readdir(path.join(__dirname, 'files-copy'));

    if (filesCopy.length) {
      for (const fileCopy of filesCopy) {
        unlink(path.join(__dirname, 'files-copy', fileCopy));
      }
    }

    for (const file of files) {
      copyFile(path.join(__dirname, 'files', file), path.join(__dirname, 'files-copy', file));
    }
  } catch (error) {
    console.error(error);
  }
})();
