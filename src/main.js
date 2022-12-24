import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Listr from 'listr';
import { exec, execSync, spawn } from 'child_process';

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
            const ls = exec('git clone https://github.com/dahas/makeUp.git . ');
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
                c.fwExists = false;
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

  let fileName = options.module;
  fileName = fileName[0].toUpperCase() + fileName.slice(1)
  options = {
    ...options,
    targetDirectory: path.join(
      options.targetDirectory || process.cwd(),
      '/makeUp/app/modules',
      fileName
    )
  };
  
  if (fs.existsSync(options.targetDirectory)) {
    console.log('%s A Module with this name already exists.', chalk.red.bold('ERROR!'));
    return;
  }

  const moduleDir = path.resolve(
    __dirname,
    '../_sources/modules/PAGE'
  );
  options.sourcesDirectory = moduleDir;

  const tasks = [];

  tasks.push({
    title: 'Configuration file created',
    task: () => {
      const filePath = path.resolve(
        options.sourcesDirectory,
        'config',
        'PAGE.ini'
      );
      const targetPath = path.join(
        options.targetDirectory || process.cwd(),
        fileName + '.ini'
      );
      createFile(
        filePath,
        targetPath,
        fileName,
        options.protected,
        options.title
      );
    }
  });

  tasks.push({
    title: 'Controller created',
    task: () => {
      const filePath = path.resolve(
        options.sourcesDirectory,
        'controller',
        'PAGE.php'
      );
      const targetPath = path.join(
        options.targetDirectory || process.cwd(),
        fileName + '.php'
      );
      createFile(filePath, targetPath, fileName);
    }
  });

  tasks.push({
    title: 'Template created',
    task: () => {
      const filePath = path.resolve(
        options.sourcesDirectory,
        'view',
        'PAGE.html'
      );
      const targetPath = path.join(
        options.targetDirectory || process.cwd(),
        fileName + '.html'
      );
      createFile(filePath, targetPath, fileName);
    }
  });

  const listr = new Listr(tasks);
  await listr.run();
  console.log('%s Module created successfully!', chalk.green.bold('DONE'));
  return true;
}

// Create a service: ------------------------------- //
export async function createService(options) {

  let fileName = options.service;
  fileName = fileName[0].toUpperCase() + fileName.slice(1)
  options = {
    ...options,
    targetDirectory: path.join(
      options.targetDirectory || process.cwd(),
      '/makeUp/services',
      fileName + '.php'
    )
  };
  
  if (fs.existsSync(options.targetDirectory)) {
    console.log('%s A Service with this name already exists.', chalk.red.bold('ERROR!'));
    return;
  }

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
  const port = 2400;
  const tasks = new Listr([
    {
      title: 'Webserver launched',
      task: () => {
        var p = path.join(process.cwd(), '/public')
        var spawn = require('child_process').spawn;
        spawn('php', ['-S', 'localhost:' + port, '-t', p], { stdio: 'inherit' });
      }
    }
  ]);

  await tasks.run().catch(e => null);
  console.log(
    chalk.green.bold('OK') +
    ` PHP webserver is running. "CTRL + C" to quit.`
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
        const sass = exec('node-sass -w makeUp/sass/styles.scss -o public/resources/css');
        sass.stdout.on('data', function (data) {
          console.log(data);
        });
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

// Launch PHP Web Server and start SASS Watcher: ------------------ //
export async function launchSassPHP() {
  const sassDetected = _detectSass();
  const port = 2400;
  const tasks = new Listr([
    sassWatcher(sassDetected),
    {
      title: 'Webserver launched',
      task: () => {
        var p = path.join(process.cwd(), '/public')
        var spawn = require('child_process').spawn;
        var ls = spawn('php', ['-S', 'localhost:' + port, '-t', p], { stdio: 'inherit' });
      }
    }
  ]);

  await tasks.run().catch(e => null);
  console.log(
    chalk.green.bold('OK') +
    ` PHP webserver is running. SASS is watching for changes. "CTRL + C" to quit.`
  );
  return true;
}

// Tasks: /////////////////////////////////////////////

async function createFile(
  sourcesDirectory,
  targetDirectory,
  fileName,
  prot,
  title
) {
  try {
    await _createPath(targetDirectory);
    let data = await _readFile(sourcesDirectory, fileName, prot, title);
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
      resolve('Folder created successfully');
    });
  });
}

function _readFile(sourcesDirectory, fileName, prot, title) {
  return new Promise((resolve, reject) => {
    fs.readFile(sourcesDirectory, 'utf8', (err, data) => {
      if (err) reject(err);
      data = data.replace(/CCCC/g, fileName);
      data = data.replace(/XXXX/g, fileName);
      data = data.replace(/FFFF/g, fileName);
      data = data.replace(/PPPP/g, prot ? '1' : '0');
      data = data.replace(/TTTT/g, title);
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
