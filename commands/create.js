const chalk = require("chalk");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const create = async (name) => {
  await exec(`wasp new ${name}`);
  console.log(chalk.green.bold("successfully!"));
};

module.exports = create;
