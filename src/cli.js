import arg from 'arg';
import inquirer from 'inquirer';
import {
  version,
  installFw,
  installDB,
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
      if (options && options.db) {
        await installDB(options);
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
      '--install-db': Boolean,
      '--create-module': Boolean,
      '--create-service': Boolean,
      '--serve': Boolean,
      '--sass': Boolean,
      '--watch': Boolean,
      '-v': '--version',
      '-i': '--install',
      '-d': '--install-db',
      '-m': '--create-module',
      '-s': '--create-service',
      '-p': '--serve',
      '-w': '--sass',
      '-h': '--watch'
    },
    {
      permissive: true,
      argv: process.argv.slice(2)
    }
  );
  return {
    version: args['--version'],
    install: args['--install'],
    db: args['--install-db'],
    module: args['--create-module'],
    service: args['--create-service'],
    webserver: args['--serve'],
    sass: args['--sass'],
    sassphp: args['--watch']
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

    questions.push({
      type: 'confirm',
      name: 'protected',
      message: 'Should the module be protected?',
      default: false
    });

    questions.push({
      type: 'input',
      name: 'title',
      message: 'Which title should be set? (Optional)',
      validate: input => {
        return true;
      }
    });

    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      module: options.modName || answers.modName,
      protected: options.protected || answers.protected,
      title: options.title || answers.title
    };
  }

  // Service options: ----------------------------- //
  if (options.service) {
    questions.push({
      type: 'input',
      name: 'srvName',
      message: 'Please enter a valid name for the service:',
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

    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      service: options.srvName || answers.srvName
    };
  }

  // DB options: ----------------------------- //
  if (options.db) {
    questions.push({
      type: 'input',
      name: 'dbHost',
      message: 'Please enter hostname:',
      default: 'localhost'
    });

    questions.push({
      type: 'input',
      name: 'dbUser',
      message: 'Please enter username:',
      default: 'root'
    });

    questions.push({
      type: 'input',
      name: 'dbPass',
      message: 'Please enter passwort:'
    });

    const answers = await inquirer.prompt(questions);

    return {
      ...options,
      dbHost: options.dbHost || answers.dbHost,
      dbUser: options.dbUser || answers.dbUser,
      dbPass: options.dbPass || answers.dbPass
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
