import * as path from 'path';
import * as treeKill from 'tree-kill';
import { exec } from 'shelljs';
import { ChildProcess } from 'child_process';
import { Logger } from '../../utils';

export interface SimulateCanOptions {
    silent: boolean;
    canInterface: string;
    iterations: number;
    simulateTime: boolean;
};

export class CanSimulatorInstance {

    private logger: Logger;

    private _childprocess: ChildProcess;
    private _canInterface: string;
    private _finished: boolean;

    public get childprocess(): ChildProcess {
        return this._childprocess;
    }
    public get canInterface(): string {
        return this._canInterface;
    }
    public get finished(): boolean {
        return this._finished;
    }

    public async stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.finished) {
                resolve();
            }
            else {
                this.childprocess.removeAllListeners();
                this.childprocess.on('exit', (code, signal) => {
                    if (signal === 'SIGTERM') {
                        this.logger.success('Can player closed');
                        resolve();
                    }
                    else {
                        this.logger.error('Can player exited');
                        reject({code, signal});
                    }
                });
                this.childprocess.on('error', (code, signal) => {
                    reject({code, signal});
                });
                treeKill(this.childprocess.pid);
            }
        });
    }

    constructor (childprocess: ChildProcess, canInterface: string, logger: Logger) {
        this._childprocess = childprocess;
        this._canInterface = canInterface;
        this.logger = logger;
        this._finished = false;

        this.childprocess.on('exit', code => {
            if (code === 0) {
                logger.success('Can player finished');
            }
            else {
                logger.error(`Can player finished with error code ${code}`);
            }
            this._finished = false;
        });
    }

}

const DEFAULT_SOURCE = path.join(__dirname, '..', '..', '..', '..', 'default_sources', 'default.can.log');
const DEFAULT_OPTIONS: SimulateCanOptions = {
    silent: true,
    canInterface: 'can0',
    iterations: Infinity,
    simulateTime: true
};

export async function simulateCan(src: string | null = DEFAULT_SOURCE, options: Partial<SimulateCanOptions> = {}): Promise<CanSimulatorInstance> {
    return new Promise<CanSimulatorInstance>((resolve) => {
        const handledSrc = src ?? DEFAULT_SOURCE;
        const handledOptions: SimulateCanOptions = {...DEFAULT_OPTIONS, ...options};
        const logger = new Logger(handledOptions.silent, 'CAN');

        const commandOptions: string[] = [`-I ${handledSrc}`];
        if (handledOptions.iterations) {
            const value = handledOptions.iterations === Infinity ? 'i' : `${handledOptions.iterations}`;
            commandOptions.push(`-l ${value}`);
        }
        if (!handledOptions.simulateTime) {
            commandOptions.push('-t');
        }
        const stringifiedCommandOptions = commandOptions.join(' ');

        logger.info('Starting canplayer');
        const childProcess = exec(`canplayer ${stringifiedCommandOptions}`, { async: true, silent: handledOptions.silent });
        logger.debug('PID:', null, childProcess.pid);
        const canSimulatorInstance = new CanSimulatorInstance(childProcess, handledOptions.canInterface, logger);
        resolve(canSimulatorInstance);
    });
}

