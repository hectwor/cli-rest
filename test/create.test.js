const chalk = require("chalk");
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const create = require('../commands/create');

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

jest.mock('chalk', () => ({
  green: {
    bold: jest.fn(),
  },
}));

describe('create function', () => {
  it('should call exec with "wasp new {name}" and log success message', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const testName = 'test';
    await create(testName);
    expect(exec).toHaveBeenCalledWith(`wasp new ${testName}`);
    expect(consoleSpy).toHaveBeenCalledWith(chalk.green.bold("successfully!"));
    consoleSpy.mockRestore();
  });
});