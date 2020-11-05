import * as chalk from 'chalk';

const PALETTE = {
    info: '#81A2BE',
    success: '#B5BD68',
    debug: '#C5C8C6',
    warning: '#F0C674',
    error: '#CC6666'
};

export class Logger {

    private silent: boolean;
    public scope: string | null;

    constructor(silent = false, scope: string | null = null) {
        this.silent = silent;
        this.scope = scope;
    }

    info(message: string, scope = this.scope, object?: any): void {
        if (!this.silent) {
            const tag = chalk.bold.blue('[INFO]');
            const handledScope = scope ? chalk.blue(`{${scope}}`) : null;
            const text = chalk.hex(PALETTE.info)(scope ? `${tag} ${handledScope} ${message}` : `${tag} ${message}`);

            if (object) {
                console.log(text, object)
            }
            else {
                console.log(text);
            } 
        }
    }
    
    success(message: string, scope = this.scope, object?: any): void {
        if (!this.silent) {
            const tag = chalk.bold.green('[SUCCESS]');
            const handledScope = scope ? chalk.green(`{${scope}}`) : null;
            const text = chalk.hex(PALETTE.success)(scope ? `${tag} ${handledScope} ${message}` : `${tag} ${message}`);

            if (object) {
                console.log(text, object)
            }
            else {
                console.log(text);
            }   
        } 
    }

    debug(message: string, scope = this.scope, object?: any): void {
        if (!this.silent) {
            const tag = chalk.bold.grey('[DEBUG]');
            const handledScope = scope ? chalk.grey(`{${scope}}`) : null;
            const text = chalk.hex(PALETTE.debug)(scope ? `${tag} ${handledScope} ${message}` : `${tag} ${message}`);

            if (object) {
                console.debug(text, object)
            }
            else {
                console.debug(text);
            }
        }
    }

    warning(message: string, scope = this.scope, object?: any): void {
        if (!this.silent) {
            const tag = chalk.bold.yellow('[WARNING]');
            const handledScope = scope ? chalk.yellow(`{${scope}}`) : null;
            const text = chalk.hex(PALETTE.warning)(scope ? `${tag} ${handledScope} ${message}` : `${tag} ${message}`);

            if (object) {
                console.warn(text, object)
            }
            else {
                console.warn(text);
            }
        }
    }

    error(message: string, scope = this.scope, error?: any) {
        if (!this.silent) {
            const tag = chalk.bold.red('[ERROR]');
            const handledScope = scope ? chalk.red(`{${scope}}`) : null;
            const text = chalk.hex(PALETTE.error)(scope ? `${tag} ${handledScope} ${message}` : `${tag} ${message}`);

            if (error) {
                console.error(text, error)
            }
            else {
                console.error(text);
            }
        }
    }

    br(n: number): void {
        if (!this.silent) {
            n = n ?? 1;
            for (let i = 0; i < n; i++) {
                console.log();
            }
        }
    }
    hr(n: number): void {
        if (!this.silent) {
            n = n ?? 1;
            const hyphens = [Object.keys(Array(50))].map(_ => '-').join('');
            for (let i = 0; i < n; i++) {
                console.log(hyphens);
            }
        }
    }

}