#!/usr/bin/env node
import * as yargs from 'yargs';
import { virtualizeCan, VirtualizeCanOptions } from '../lib/modules/virtualizeCan';

yargs
    .scriptName('eagle')
    .command(
        'virtualize',
        'Virtualize a canbus interface',
        function (yargs) {
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
    .demandCommand(1, 'You must use either virtualize of simulate command')
    .epilogue('For more information, find our manual at https://github.com/eagletrt/eagletrt-telemetria-simulator#readme')
    .argv
