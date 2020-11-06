import * as path from 'path';
import * as treeKill from 'tree-kill';
import { exec } from 'shelljs';
import { ChildProcess } from 'child_process';
import { Logger } from '../../utils';

export interface SimulateGpsOptions {
    silent: boolean;
    // TODO: iterations: number; 
    // TODO: simulateTime: boolean;
};

export type GpsInterfaceCallback = (gpsInterface: string) => void;

export class GpsSimulatorInstance {

    private logger: Logger;

    private _childprocess: ChildProcess;
    private _gpsInterface: string | null;
    private _finished: boolean;

    public gpsInterfaceListener: GpsInterfaceCallback = () => { };

    public get childprocess(): ChildProcess {
        return this._childprocess;
    }
    public get gpsInterface(): string | null {
        return this._gpsInterface;
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
                this.childprocess.on('exit', (code, signal) => {
                    if (signal === 'SIGTERM') {
                        this.logger.success('Gps player closed');
                        resolve();
                    }
                    else {
                        this.logger.error('Gps player exited');
                        reject({ code, signal });
                    }
                });
                this.childprocess.on('error', (code, signal) => {
                    reject({ code, signal });
                });
                treeKill(this.childprocess.pid);
            }
        });
    }

    constructor(childprocess: ChildProcess, logger: Logger) {
        this._childprocess = childprocess;
        this.logger = logger;
        this._finished = false;

        this.childprocess.stdout?.setEncoding('utf8');
        this.childprocess.stdout?.on('data', data => {
            console.log('entrato')
            console.log(data.toString())
        });

        this.childprocess.on('exit', () => {
            this._finished = false;
            logger.success('Gps player finished');
        });
    }

}

const DEFAULT_SOURCE = path.join(__dirname, '..', '..', '..', '..', 'default_sources', 'default.gps.ubx');
const DEFAULT_OPTIONS: SimulateGpsOptions = {
    silent: true,
    // iterations: Infinity,
    // simulateTime: true
};

export async function simulateGps(src: string | null = DEFAULT_SOURCE, options: Partial<SimulateGpsOptions> = {}): Promise<GpsSimulatorInstance> {
    return new Promise<GpsSimulatorInstance>((resolve, reject) => {
        const handledSrc = src ?? DEFAULT_SOURCE;
        const handledOptions: SimulateGpsOptions = { ...DEFAULT_OPTIONS, ...options };
        const logger = new Logger(handledOptions.silent, 'GPS');

        const commandOptions: string[] = [ handledSrc ];
        // if (handledOptions.iterations) {
        //     const value = handledOptions.iterations === Infinity ? 'i' : `${handledOptions.iterations}`;
        //     commandOptions.push(`-l ${value}`);
        // }
        // if (!handledOptions.simulateTime) {
        //     commandOptions.push('-t');
        // }
        const stringifiedCommandOptions = commandOptions.join(' ');
        const pathToGpsSimulator = path.join(__dirname, '..', '..', '..', '..', 'gps_simulator', 'gps_simulator.out');

        console.log(pathToGpsSimulator)

        console.log(DEFAULT_SOURCE)

        logger.info('Starting gps simulator');
        const childProcess = exec(`${pathToGpsSimulator} ${stringifiedCommandOptions}`, { async: true, silent: handledOptions.silent });
        logger.debug('PID:', null, childProcess.pid);
        const gpsSimulatorInstance = new GpsSimulatorInstance(childProcess, logger);
        resolve(gpsSimulatorInstance);
    });
}

