const Listr = require('listr');
const chalk = require('chalk');
const { exec, execSync } = require('child_process');

const tasks = new Listr([
    {
        title: 'Downloading framework ...',
        task: async (c, t) => {
            await new Promise((resolve, reject) => {
                const ls = exec('git clone https://github.com/dahas/cookie_management.git aaa');

                ls.on('exit', (code) => {
                    resolve(`child process exited with code ${code}`);
                    t.title = 'Framework downloaded'
                });
            });
        }
    },
    {
        title: 'Installing dependencies ...',
        task: async (c, t) => {
            await new Promise((resolve, reject) => {
                const ls = exec('npm --prefix ./public i ./public');

                ls.on('exit', (code) => {
                    resolve(`child process exited with code ${code}`);
                    t.title = 'Dependencies installed'
                });
            });
        }
    }
]);

tasks.run()
    .then(() => console.log('%s makeUp installed successfully!', chalk.green.bold('DONE')))
    .catch(err => {
    // console.error(err);
});

return true;
