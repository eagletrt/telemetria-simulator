#!/usr/bin/env node
import * as yargs from 'yargs';
import { virtualizeCan, VirtualizeCanOptions } from '../lib/modules/virtualizeCan';
import { simulateCan, SimulateCanOptions } from '../lib/modules/simulateCan';

yargs
    .scriptName('eagle')
    .command(
        'virtualize',
        'Virtualize a canbus interface',
        yargs => {
            yargs
                .command(
                    'can',
                    'Creates a can interface',
                    () => {},
                    async argv => {
                        const args: any = argv;
                        const canInterface = args.canInterface;
                        const options: VirtualizeCanOptions = {
                            silent: args.silent
                        };
                        await virtualizeCan(canInterface, options);
                    }
                )
                .demandCommand(1, 'You must specify the command "can"')
                .options({
                    'can-interface': {
                        alias: 'i',
                        default: 'can0',
                        describe: 'The name of the can interface to create',
                        type: 'string'
                    },
                    'silent': {
                        alias: 's',
                        default: false,
                        describe: 'If logs will be displayed',
                        type: 'boolean'
                    }
                })
                .argv
        }
    )
    .command(
        'simulate',
        'Simulate a canbus or a gps',
        yargs => {
            yargs
                .command(
                    'can',
                    'Simulates a canbus by sending messages from a log',
                    () => {},
                    async argv => {
                        const args: any = argv;
                        const log = args.log;
                        const options: SimulateCanOptions = {
                            canInterface: args.canInterface,
                            silent: args.silent,
                            iterations: args.iterations,
                            simulateTime: args.simulateTime
                        };
                        await simulateCan(log, options);
                    }
                )
                .demandCommand(1, 'You must specify either the command "can" or the command "gps"')
                .options({
                    'log': {
                        alias: 'l',
                        default: null,
                        describe: 'The log file that contains the messages to be sent over the can',
                        defaultDescription: 'There is a module built-in default canlog if nothing is specified',
                        type: 'string'
                    },
                    'can-interface': {
                        alias: 'i',
                        default: 'can0',
                        describe: 'The name of the can interface to create',
                        type: 'string'
                    },
                    'silent': {
                        alias: 's',
                        default: false,
                        describe: 'If logs will be displayed',
                        type: 'boolean'
                    },
                    'simulate-time': {
                        alias: 't',
                        default: true,
                        describe: 'If the time of the can log will be simulated',
                        type: 'boolean'
                    },
                    'iterations': {
                        alias: 'n',
                        default: Infinity,
                        describe: 'The number of iterations in which the can log file will be sent to the canbus',
                        defaultDescription: 'If nothing is specified, the file is sent in an infinite loop',
                        type: 'number'
                    }
                })
                .argv;
        }
    )
    .demandCommand(1, 'You must use either virtualize of simulate command')
    .epilogue('For more information, find our manual at https://github.com/eagletrt/eagletrt-telemetria-simulator#readme')
    .argv;