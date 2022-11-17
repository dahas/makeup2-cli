import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Listr from 'listr';
import { exec, execSync } from 'child_process';

// OPTIONS: ///////////////////////////////////////////

// Get the version: -------------------------------- //
export async function version() {
  var pjson = require('../package.json');
  console.log('makeUp cli v' + pjson.version);
  return true;
}

// Install framework: ------------------------------ //
export async function installFw() {
  const tasks = new Listr([
    {
      title: 'Downloading framework ...',
      task: async (c, t) => {
        if (!_detectGit()) {
          // ---- NO GIT
          t.title = 'Download failed';
          t.skip(
            'Git not found. Please download and install from here: https://git-scm.com/download'
          );
          c.fwExists = false;
        } else {
          await new Promise((resolve, reject) => {
            const ls = exec('git clone https://github.com/dahas/makeup2.git . ');
            ls.on('exit', code => {
              if (code == 0) {
                // ---- OK
                resolve(`child process exited with code ${code}`);
                t.title = 'Framework downloaded';
                c.fwExists = true;
                fs.rm('.git', { recursive: true }, () => { return; }); // Clean up!
              } else if (code >= 1 && code < 128) {
                // ---- ERROR
                resolve(`Child process exited with code ${code}`);
                t.title = 'Download failed';
                t.skip(`Child process exited with code ${code}`);
                c.fwExists = false;
              } else {
                // ---- EXISTS
                resolve(`Child process exited with code ${code}`);
                t.title = 'Download stopped';
                t.skip('Directory not empty.');
                c.fwExists = true;
              }
            });
          });
        }
      }
    },
    {
      title: 'Installing dependencies ...',
      task: async (c, t) => {
        if (!c.fwExists) {
          // ---- NO FRAMEWORK
          t.title = 'Installation aborted';
          t.skip('Framework missing');
        } else {
          await new Promise((resolve, reject) => {
            const ls = exec('cd public && npm i');
            ls.on('exit', code => {
              resolve(`child process exited with code ${code}`);
              t.title = 'Dependencies installed';
            });
          });
        }
      }
    }
  ]);

  tasks
    .run()
    .then(c => {
      if (c.fwExists) {
        console.log(
          '%s makeUp installed successfully!',
          chalk.green.bold('DONE')
        );
      } else {
        console.log(
          '%s makeUp could not be installed!',
          chalk.red.bold('ERROR')
        );
      }
    })
    .catch(err => {
      // console.error(err);
    });

  return true;
}

// Create a module: -------------------------------- //
export async function createModule(options) {
  let fileName = options.module
    .replace(/\.?([A-Z]+)/g, (x, y) => '_' + y.toLowerCase())
    .replace(/^_/, '');
  options = {
    ...options,
    targetDirectory: path.join(
      options.targetDirectory || process.cwd(),
      '/makeup/modules',
      fileName
    )
  };

  const moduleDir = path.resolve(
    __dirname,
    '../_sources/modules/' + options.modType
  );
  options.sourcesDirectory = moduleDir;

  const tasks = [];

  tasks.push({
    title: 'Configuration file created',
    task: () => {
      const filePath = path.resolve(
        options.sourcesDirectory,
        'config',
        options.modType + '.ini'
      );
      const targetPath = path.join(
        options.targetDirectory || process.cwd(),
        'config',
        fileName + '.ini'
      );
      createFile(
        filePath,
        targetPath,
        fileName,
        options.module,
        options.modProt
      );
    }
  });

  if (options.modType === 'PAGE' || options.modType === 'CONTENT') {
    tasks.push({
      title: 'Controller created',
      task: () => {
        const filePath = path.resolve(
          options.sourcesDirectory,
          'controller',
          options.modType + '.php'
        );
        const targetPath = path.join(
          options.targetDirectory || process.cwd(),
          'controller',
          fileName + '.php'
        );
        createFile(filePath, targetPath, fileName, options.module);
      }
    });

    tasks.push({
      title: 'Template created',
      task: () => {
        const filePath = path.resolve(
          options.sourcesDirectory,
          'view',
          options.modType + '.html'
        );
        const targetPath = path.join(
          options.targetDirectory || process.cwd(),
          'view',
          fileName + '.html'
        );
        createFile(filePath, targetPath, fileName, options.module);
      }
    });
  }

  const listr = new Listr(tasks);
  await listr.run();
  console.log('%s Module created successfully!', chalk.green.bold('DONE'));
  return true;
}

// Create a service: ------------------------------- //
export async function createService(options) {
  options = {
    ...options,
    targetDirectory: path.join(
      options.targetDirectory || process.cwd(),
      '/makeup/services',
      options.service.toLowerCase() + '.php'
    )
  };

  const serviceFile = path.resolve(__dirname, '../_sources/services/SRV.php');
  options.sourcesDirectory = serviceFile;

  const tasks = new Listr([
    {
      title: 'File created',
      task: () =>
        createFile(
          options.sourcesDirectory,
          options.targetDirectory,
          options.service,
          options.service
        )
    }
  ]);

  await tasks.run();
  console.log('%s Service created successfully!', chalk.green.bold('DONE'));
  return true;
}

// Launch build in PHP webserver: ------------------ //
export async function launchWebserver() {
  const sassDetected = _detectSass();
  const port = 2400;
  const tasks = new Listr([
    sassWatcher(sassDetected),
    {
      title: 'Webserver launched',
      task: () => {
        const phpServer = require('php-server');
        phpServer({
          port: port,
          base: './public'
        });
      }
    }
  ]);

  await tasks.run().catch(e => null);
  console.log(
    chalk.green.bold('OK') +
      ` Webserver is running on http://localhost:${port} ...`
  );
  return true;
}

// Launch SASS watcher: ---------------------------- //
export async function launchSass() {
  const sassDetected = _detectSass();
  const tasks = new Listr([sassWatcher(sassDetected)]);

  await tasks
    .run()
    .then(() => {
      if (sassDetected) {
        console.log(
          chalk.green.bold('OK') + ' Watching for changes in scss files ...'
        );
      }
    })
    .catch(() => null);

  return true;
}

function sassWatcher(sassDetected) {
  if (sassDetected) {
    return {
      title: 'SASS watcher enabled',
      task: () => {
        exec('node-sass -w public/sass/styles.scss -o public/resources/css');
      }
    };
  } else {
    return {
      title: 'SASS not found',
      skip: () => {
        return 'Please run: npm i -g node-sass';
      },
      task: () => {
        null;
      }
    };
  }
}

// Tasks: /////////////////////////////////////////////

async function createFile(
  sourcesDirectory,
  targetDirectory,
  fileName,
  className,
  prot
) {
  try {
    await _createPath(targetDirectory);
    let data = await _readFile(sourcesDirectory, fileName, className, prot);
    return await _writeFile(targetDirectory, data);
  } catch (e) {
    console.error('%s' + e, chalk.red.bold('ERROR'));
  }
}

// Helper: /////////////////////////////////////////////

function _createPath(targetDirectory) {
  let basepath = path.dirname(targetDirectory);
  return new Promise((resolve, reject) => {
    fs.mkdir(basepath, { recursive: true }, err => {
      if (err) reject(err);
      resolve('Folders created successfully');
    });
  });
}

function _readFile(sourcesDirectory, fileName, className, prot) {
  return new Promise((resolve, reject) => {
    fs.readFile(sourcesDirectory, 'utf8', (err, data) => {
      if (err) reject(err);
      className = className.charAt(0).toUpperCase() + className.slice(1); // Uppercase first letter
      data = data.replace(/CCCC/g, className);
      data = data.replace(/XXXX/g, className);
      data = data.replace(/FFFF/g, fileName);
      data = data.replace(/PPPP/g, prot ? '1' : '0');
      resolve(data);
    });
  });
}

function _writeFile(targetDirectory, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(targetDirectory, data, err => {
      if (err) reject(err);
      resolve('The file has been saved!');
    });
  });
}

function _detectGit() {
  try {
    execSync('git --version');
    return true;
  } catch (e) {
    return false;
  }
}

function _detectSass() {
  try {
    execSync('node-sass --version');
    return true;
  } catch (e) {
    return false;
  }
}
