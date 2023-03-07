const npm = require('npm-commands');
const cp = require ('child_process');

cp.exec('start cmd.exe /K node NodeTaskHandler.js');

npm().run('dev');