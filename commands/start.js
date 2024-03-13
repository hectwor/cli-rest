const chalk = require("chalk");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const start = async (name) => {
  await exec(`wasp start`);
  console.log(chalk.green.bold("successfully!"));
};

module.exports = start;
