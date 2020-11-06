#!/usr/bin/env node
import * as yargs from 'yargs';
import { virtualizeCan, VirtualizeCanOptions } from '../lib/modules/virtualizeCan';
import { simulateCan, SimulateCanOptions } from '../lib/modules/simulateCan';
import { simulateGps, SimulateGpsOptions } from '../lib/modules/simulateGps';

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
        'Simulate a canbus or a gps or both',
        yargs => {
            yargs
                .command(
                    'can',
                    'Simulates a canbus by sending messages from a log',
                    (yargs) => {
                        yargs
                            .options({
                                'log': {
                                    alias: 'l',
                                    default: null,
                                    describe: 'The log file that contains the messages to be sent over the can',
                                    defaultDescription: 'There is a module built-in default can log if nothing is specified',
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
                            });
                    },
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
                .command(
                    'gps',
                    'Simulates a gps by sending messages from a log',
                    (yargs) => {
                        yargs
                            .options({
                                'log': {
                                    alias: 'l',
                                    default: null,
                                    describe: 'The log file that contains the messages to be sent over the gps',
                                    defaultDescription: 'There is a module built-in default gps log if nothing is specified',
                                    type: 'string'
                                },
                                'silent': {
                                    alias: 's',
                                    default: false,
                                    describe: 'If logs will be displayed',
                                    type: 'boolean'
                                }
                            });
                    },
                    async argv => {
                        const args: any = argv;
                        const log = args.log;
                        const options: SimulateGpsOptions = {
                            silent: args.silent,
                        };
                        await simulateGps(log, options);
                    }
                )
                .command(
                    'all',
                    'Simulates both a canbus and a gps',
                    (yargs) => {
                        yargs
                            .options({
                                'can-log': {
                                    alias: 'c',
                                    default: null,
                                    describe: 'The log file that contains the messages to be sent over the can',
                                    defaultDescription: 'There is a module built-in default can log if nothing is specified',
                                    type: 'string'
                                },
                                'gps-log': {
                                    alias: 'g',
                                    default: null,
                                    describe: 'The log file that contains the messages to be sent over the gps',
                                    defaultDescription: 'There is a module built-in default gps log if nothing is specified',
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
                            });
                    },
                    async argv => {
                        const args: any = argv;

                        const canLog = args.canLog;
                        const gpsLog = args.gpsLog;
            
                        const canOptions: SimulateCanOptions = {
                            canInterface: args.canInterface,
                            silent: args.silent,
                            iterations: args.iterations,
                            simulateTime: args.simulateTime
                        };
                        const gpsOptions: SimulateGpsOptions = {
                            silent: args.silent,
                        };
            
                        await Promise.all([
                            simulateCan(canLog, canOptions),
                            simulateGps(gpsLog, gpsOptions)
                        ]);
                    }
                )
                .demandCommand(1, 'You must use "can", "gps" or "all" command')
                .argv;
        }
    )
    .demandCommand(1, 'You must use either virtualize of simulate command')
    .epilogue('For more information, find our manual at https://github.com/eagletrt/eagletrt-telemetria-simulator#readme')
    .argv;