import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import Listr from 'listr';

const childProcess = require('child_process');


// Get the version
export async function version() {
  var pjson = require('../package.json');
  console.log('makeUp cli v' + pjson.version);
  return true;
}


// Create a module: ----------------------------- //
export async function createModule(options) {
  // const components = ['config', 'controller', 'view'];
  options = {
    ...options,
    targetDirectory: path.join(
      options.targetDirectory || process.cwd(),
      '/makeup/modules',
      options.module.toLowerCase()
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
        options.module.toLowerCase() + '.ini'
      )
      createFile(filePath, targetPath, options.module.toLowerCase(), options.modProt)
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
          options.module.toLowerCase() + '.php'
        )
        createFile(filePath, targetPath, options.module)
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
          options.module + '.html'
        )
        createFile(filePath, targetPath, options.module)
      }
    });
  }

  const listr = new Listr(tasks);
  await listr.run();
  console.log('%s Module created successfully!', chalk.green.bold('DONE'));
  return true;
}


// Create a service: ---------------------------- //
export async function createService(options) {
  options = {
    ...options,
    targetDirectory: path.join(
      options.targetDirectory || process.cwd(),
      '/makeup/services',
      options.service.toLowerCase() + '.php'
    )
  };

  const serviceFile = path.resolve(
    __dirname,
    '../_sources/services/SRV.php'
  );
  options.sourcesDirectory = serviceFile;

  const tasks = new Listr([
    {
      title: 'File created',
      task: () => createFile(options.sourcesDirectory, options.targetDirectory, options.service),
    }
  ]);

  await tasks.run();
  console.log('%s Service created successfully!', chalk.green.bold('DONE'));
  return true;
}


// Launch build in PHP webserver: --------------- //
export async function launchWebserver() {
  const sassDetected = _detectSass();
  const port = 2400;
  const tasks = new Listr([
    _sassWatcher(sassDetected),
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
  console.log(chalk.green.bold('OK') + ` Webserver is running on http://localhost:${port} ...`);
  return true;
}


// Launch SASS watcher: --------------- //
export async function launchSass() {
  const sassDetected = _detectSass();
  const tasks = new Listr([_sassWatcher(sassDetected)]);

  await tasks.run()
    .then(() => {
      if (sassDetected) {
        console.log(chalk.green.bold('OK') + ' Watching for changes in scss files ...');
      }
    })
    .catch(() => null);

  return true;
}


// Tasks: ------------------------------------------- //

async function createFile(sourcesDirectory, targetDirectory, className, prot) {
  try {
    await _createPath(targetDirectory);
    let data = await _readFile(sourcesDirectory, className, prot);
    return await _writeFile(targetDirectory, data);
  } catch (e) {
    console.error('%s' + e, chalk.red.bold('ERROR'));
  }
}


// Helper: ------------------------------------------- //

function _createPath(targetDirectory) {
  let basepath = path.dirname(targetDirectory);
  return new Promise((resolve, reject) => {
    fs.mkdir(basepath, { recursive: true }, (err) => {
      if (err) reject(err);
      resolve('Folders created successfully');
    });
  });
}

function _readFile(sourcesDirectory, className, prot) {
  return new Promise((resolve, reject) => {
    fs.readFile(sourcesDirectory, 'utf8', (err, data) => {
      if (err) reject(err);
      className = className.charAt(0).toUpperCase() + className.slice(1); // Uppercase first letter
      data = data.replace(/XXXX/g, className);
      data = data.replace(/PPPP/g, prot ? '1' : '0')
      resolve(data);
    });
  })
}

function _writeFile(targetDirectory, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(targetDirectory, data, (err) => {
      if (err) reject(err);
      resolve('The file has been saved!');
    });
  });
}

function _sassWatcher(sassDetected) {
  if (sassDetected) {
    return {
      title: 'SASS watcher enabled',
      task: () => {
        childProcess.exec('node-sass -w public/sass/styles.scss -o public/resources/css');
      }
    }
  } else {
    return {
      title: 'SASS not found',
      skip: () => {
        return 'Please run: npm i -g node-sass';
      },
      task: () => { null }
    }
  }
}

function _detectSass() {
  try {
    childProcess.execSync('node-sass --version');
    return true;
  } catch (e) {
    return false;
  }
}
