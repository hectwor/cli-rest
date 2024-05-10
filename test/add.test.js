const exec = require('child_process').exec;
const readline = require('readline');
const chalk = require('chalk');
const add = require('../commands/add');

jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

jest.mock('readline', () => ({
  createInterface: () => ({
    question: jest.fn(),
  }),
}));

jest.mock('chalk', () => ({
  green: {
    bold: jest.fn(),
  },
  red: jest.fn(),
  yellow: jest.fn(),
}));

describe('add function', () => {
  it('should be defined', () => {
    expect(add).toBeDefined();
  });

  it('should handle AUTH action correctly', async () => {
    readline.question.mockImplementationOnce((question, options, callback) => callback('AUTH'));
    await add('test');
    expect(console.log).toHaveBeenCalledWith(chalk.yellow('Disable'));
  });

  it('should handle CRUD action correctly', async () => {
    readline.question.mockImplementationOnce((question, options, callback) => callback('CRUD'));
    await add('test');
    expect(exec).toHaveBeenCalledWith(expect.stringContaining('entity'));
    expect(exec).toHaveBeenCalledWith(expect.stringContaining('crud'));
    expect(console.log).toHaveBeenCalledWith(chalk.green('Entity created successfully'));
  });

  it('should handle MIDDLEWARE action correctly', async () => {
    readline.question.mockImplementationOnce((question, options, callback) => callback('MIDDLEWARE'));
    await add('test');
    expect(console.log).toHaveBeenCalledWith(chalk.yellow('Disable'));
  });

  it('should handle API action correctly', async () => {
    readline.question.mockImplementationOnce((question, options, callback) => callback('API'));
    await add('test');
    expect(exec).toHaveBeenCalledWith(expect.stringContaining('api'));
    expect(console.log).toHaveBeenCalledWith(chalk.green.bold('successfully!'));
  });

  it('should handle errors correctly', async () => {
    exec.mockImplementationOnce(() => { throw new Error('Test error') });
    await add('test');
    expect(console.log).toHaveBeenCalledWith(chalk.red('Test error'));
  });
});