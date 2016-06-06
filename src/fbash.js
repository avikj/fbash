#!/usr/bin/env node
/**
 * This is the entry point for the CLI.
 */

var package = require('../package.json');
var program = require('commander');

program
  .version(package.version)
  .command('start', 'Starts an fbash process in the user home directory.')
  .command('stop', 'Stops all running fbash processes.')
  .parse(process.argv);
