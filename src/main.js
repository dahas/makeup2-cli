import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import Listr from 'listr';
import execa from 'execa';

const access = promisify(fs.access);


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

  // try {
  //   await access(moduleDir, fs.constants.R_OK);
  // } catch (err) {
  //   console.error('%s Invalid module name', chalk.red.bold('ERROR'));
  //   process.exit(1);
  // }

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

  // try {
  //   await access(serviceFile, fs.constants.R_OK);
  // } catch (err) {
  //   console.error('%s Invalid service name', chalk.red.bold('ERROR'));
  //   process.exit(1);
  // }

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
  const sassDetected = detectSass();
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
  console.log(`%s Webserver is running on http://localhost:${port} ...`, chalk.green.bold('OK'));
  return true;
}


// Launch SASS watcherr: --------------- //
export async function launchSass() {
  const sassDetected = detectSass();
  const tasks = new Listr([sassWatcher(sassDetected)]);

  await tasks.run()
    .then(() => {
      if (sassDetected) {
        console.log(`%s Watching for changes in scss files ...`, chalk.green.bold('OK'))
      }
    })
    .catch(() => null);

  return true;
}


// Tasks: ------------------------------------------- //

async function createFile(sourcesDirectory, targetDirectory, className, prot) {
  try {
    await createPath(targetDirectory);
    let data = await readFile(sourcesDirectory, className, prot);
    return await writeFile(targetDirectory, data);
  } catch (e) {
    console.error('%s' + e, chalk.red.bold('ERROR'));
  }
}


// Helper: ------------------------------------------- //

function createPath(targetDirectory) {
  let basepath = path.dirname(targetDirectory);
  return new Promise((resolve, reject) => {
    fs.mkdir(basepath, { recursive: true }, (err) => {
      if (err) reject(err);
      resolve('Folders created successfully');
    });
  });
}

function readFile(sourcesDirectory, className, prot) {
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

function writeFile(targetDirectory, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(targetDirectory, data, (err) => {
      if (err) reject(err);
      resolve('The file has been saved!');
    });
  });
}

function sassWatcher(sassDetected) {
  if (sassDetected) {
    return {
      title: 'SASS watcher enabled',
      task: () => {
        execa('node-sass', ['-w', '-o'], ['public/sass/styles.scss', 'public/resources/css'])
            .catch(() => null);
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

function detectSass() {
  try {
    require('child_process').execSync('node-sass --version');
    return true;
  } catch (e) {
    return false;
  }
}
