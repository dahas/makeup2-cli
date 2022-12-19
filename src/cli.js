import arg from 'arg';
import inquirer from 'inquirer';
import {
  version,
  installFw,
  createModule,
  createService,
  launchSass,
  launchWebserver,
  launchSassPHP
} from './main';

export async function cli() {
  try {
    let options = applyArgs();
    if (options && options.version) {
      await version();
    } else if (options && options.install) {
      await installFw();
    } else if (options && options.webserver) {
      await launchWebserver();
    } else if (options && options.sass) {
      await launchSass();
    } else if (options && options.sassphp) {
      await launchSassPHP();
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
    console.log('Error: Something went wrong!');
  }
}

function applyArgs() {
  const args = arg(
    {
      '--version': Boolean,
      '--install': Boolean,
      '--create-module': Boolean,
      '--create-service': Boolean,
      '--php': Boolean,
      '--sass': Boolean,
      '--serve': Boolean,
      '-v': '--version',
      '-i': '--install',
      '-m': '--create-module',
      '-s': '--create-service',
      '-p': '--php',
      '-w': '--sass',
      '-h': '--serve'
    },
    {
      permissive: true,
      argv: process.argv.slice(2)
    }
  );
  return {
    version: args['--version'],
    install: args['--install'],
    module: args['--create-module'],
    service: args['--create-service'],
    webserver: args['--php'],
    sass: args['--sass'],
    sassphp: args['--serve']
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
      validate: input => {
        let validChars = input.length > 0 && /^[a-zA-Z]+$/.test(input);
        let validName = !phpReservedWords.includes(input);
        if (validChars && validName)
          return true;
        if (!validChars)
          return "Only letters are allowed!"
        if (!validName)
          return "This name is reserved by PHP!"
      }
    });
    // questions.push({
    //   type: 'list',
    //   name: 'modType',
    //   message: 'Of what type is the module supposed to be?',
    //   choices: ['PAGE', 'CONTENT', 'MENU'],
    //   default: 'PAGE'
    // });
    questions.push({
      type: 'confirm',
      name: 'modProt',
      message: 'Should the module be protected?',
      default: false
    });

    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      module: options.modName || answers.modName,
      modType: 'PAGE', // modType: options.modType || answers.modType,
      modProt: options.modProt || answers.modProt
    };
  }

  // Service options: ----------------------------- //
  if (options.service) {
    questions.push({
      type: 'input',
      name: 'srvName',
      message: 'Please enter a valid name for the service:',
      validate: input => {
        return input.length > 0 && /^[a-zA-Z]+$/.test(input);
      }
    });

    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      service: options.srvName || answers.srvName
    };
  }
}

const phpReservedWords = [
  'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch',
  'class', 'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else',
  'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile',
  'eval', 'exit', 'extends', 'final', 'finally', 'for', 'foreach', 'function', 'generator', 'global', 'goto',
  'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset',
  'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require',
  'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while',
  'xor', 'yield', 'int', 'float', 'bool', 'string', 'mixed', 'void', 'null', 'true', 'false', 'iterable',
  'resource', 'numeric', 'object',
];
