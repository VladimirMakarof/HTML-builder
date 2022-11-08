const { createReadStream, createWriteStream } = require('fs');
const { rm, mkdir, readdir, stat, copyFile } = require('fs/promises');
const { resolve, extname, basename, dirname } = require('path');

const distName = 'project-dist';

async function buildLayout(distName) {
  const distPath = resolve(__dirname, distName);
  await rm(distPath, { recursive: true, force: true });
  await mkdir(distPath, { recursive: true });
  buildHTML(
    resolve(distPath, 'index.html'),
    resolve(__dirname, 'template.html'),
    resolve(__dirname, 'components'),
  );
  buildStyles(resolve(distPath, 'style.css'), resolve(__dirname, 'styles'));
  buildAssets(resolve(distPath, 'assets'), resolve(__dirname, 'styles'));
}

async function buildHTML(bundlePath, templatePath, componentsDirPath) {
  const template = { path: templatePath };
  template.content = await getFileContent(template.path);

  const components = await getComponents(componentsDirPath, '.html');

  for (const component of components) {
    template.content = template.content.replaceAll(`{{${component.name}}}`, component.content);
  }

  const stream = createWriteStream(bundlePath);
  stream.write(template.content);
}

async function getComponents(dirPath, ext) {
  const files = await readdir(dirPath, { withFileTypes: true });
  const components = files.reduce(async (p, c) => {
    const path = resolve(dirPath, c.name);
    if (!c.isFile() || extname(path) !== ext) return p;
    const content = await getFileContent(path);
    const name = basename(path, ext);
    return [...(await p), { name, path, content }];
  }, []);
  return components;
}

function getFileContent(path) {
  return new Promise(function (res) {
    let content = '';
    const stream = createReadStream(path, 'utf-8');
    stream.on('data', (chunk) => {
      content += chunk;
    });
    stream.on('end', () => res(content));
  });
}

async function buildStyles(bundlePath, componentsPath) {
  const fileNames = await readdir(componentsPath, { withFileTypes: true });
  const filePaths = fileNames.reduce((p, c) => {
    const path = resolve(componentsPath, c.name);
    if (!c.isFile() || extname(path) !== '.css') return p;
    return [...p, path];
  }, []);
  const writeStream = createWriteStream(bundlePath);
  const readStreams = filePaths.map((filePath) => createReadStream(filePath).pipe(writeStream));
}

async function buildAssets() {
  const dirPath = resolve(__dirname, 'assets');
  const distPath = resolve(dirname(dirPath), distName, basename(dirPath));

  await rm(distPath, { recursive: true, force: true });
  await mkdir(distPath, { recursive: true });

  const filePaths = await getFilePaths(dirPath);
  await Promise.all(
    filePaths.map(async (v) => {
      const dest = v.replace(dirPath, distPath);
      await mkdir(dirname(dest), { recursive: true });
      copyFile(v, dest);
    }),
  );
}

async function getFilePaths(dir) {
  const fileNames = await readdir(dir);
  const filePaths = fileNames.map((v) => resolve(dir, v));

  return filePaths.reduce(async (p, c) => {
    if ((await stat(c)).isFile()) return [...(await p), c];
    return [...(await p), ...(await getFilePaths(c))];
  }, []);
}

buildLayout(distName);
