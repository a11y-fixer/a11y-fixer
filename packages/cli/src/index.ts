#!/usr/bin/env node
import { program } from 'commander';
import { scanCommand } from './commands/scan.js';
import { fixCommand } from './commands/fix.js';
import { checkCommand } from './commands/check.js';

program
  .name('a11y-fixer')
  .description('Automatically find and fix accessibility violations in your source code')
  .version('0.1.0');

program.addCommand(scanCommand());
program.addCommand(fixCommand());
program.addCommand(checkCommand());

program.parse();
