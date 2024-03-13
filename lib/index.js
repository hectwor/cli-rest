#! /usr/bin/env node
const { program } = require('commander')
const add = require('../commands/add')
const create = require('../commands/create')
const start = require('../commands/start')

program
    .command('add')
    .description('Add')
    .action(add)

program
    .command('create <name>')
    .description('Create wasp project')
    .action(create)

program
    .command('start')
    .description('Create wasp project')
    .action(start)

program.parse()