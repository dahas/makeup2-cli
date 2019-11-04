import arg from 'arg';
import inquirer from 'inquirer';
import { version, createModule, createService, launchWebserver, launchSass } from './main';


export async function cli() {
  try {
    let options = applyArgs();
    if (options && options.version) {
      await version();
    } else if (options && options.webserver) {
      await launchWebserver();
    } else if (options && options.sass) {
      await launchSass();
    } else {
      options = await prompt(options);
      if (options && options.module) {
        await createModule(options);
      }
      if (options && options.service) {
        await createService(options);
      }
    }
  } catch (e) {
    // console.log(e)
    console.log('Error: Something went wrong!')
  }
}


function applyArgs() {
  const args = arg(
    {
      '--version': Boolean,
      '--create-module': Boolean,
      '--create-service': Boolean,
      '--serve': Boolean,
      '--scss': Boolean,
      '-v': '--version',
      '-m': '--create-module',
      '-s': '--create-service',
      '-p': '--serve',
      '-w': '--scss'
    },
    { 
      permissive: true,
      argv: process.argv.slice(2) 
    }
  );
  return {
    version: args['--version'],
    module: args['--create-module'],
    service: args['--create-service'],
    webserver: args['--serve'],
    sass: args['--scss']
  };
}


async function prompt(options) {
  const questions = [];

  // Module options: ----------------------------- //
  if (options.module) {
    questions.push({
      type: 'input',
      name: 'modName',
      message: 'Please enter a valid name for the module:',
      validate: (input) => {
        return input.length > 0 && /^[a-zA-Z]+$/.test(input)
      }
    });
    questions.push({
      type: 'list',
      name: 'modType',
      message: 'Of what type is the module supposed to be?',
      choices: ['PAGE', 'CONTENT', 'MENU'],
      default: 'PAGE',
    });
    questions.push({
      type: 'confirm',
      name: 'modProt',
      message: 'Should the module be protected?',
      default: false,
    });

    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      module: options.modName || answers.modName,
      modType: options.modType || answers.modType,
      modProt: options.modProt || answers.modProt,
    };
  }

  // Service options: ----------------------------- //
  if (options.service) {
    questions.push({
      type: 'input',
      name: 'srvName',
      message: 'Please enter a valid name for the service:',
      validate: (input) => {
        return input.length > 0 && /^[a-zA-Z]+$/.test(input)
      }
    });

    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      service: options.srvName || answers.srvName
    };
  }
}
