const chalk = require("chalk");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const start = require('../commands/start');

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

jest.mock('chalk', () => ({
  green: {
    bold: jest.fn(),
  },
}));

describe('start function', () => {
  it('should call exec with "wasp start" and log success message', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    await start('test');
    expect(exec).toHaveBeenCalledWith('wasp start');
    expect(consoleSpy).toHaveBeenCalledWith(chalk.green.bold("successfully!"));
    consoleSpy.mockRestore();
  });
});