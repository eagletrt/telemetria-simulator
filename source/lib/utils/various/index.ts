import { exec, ExecOptions } from 'shelljs';

export async function execAsync(command: string, options: ExecOptions = {}): Promise<{ code: number; stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
        exec(command, {...options, async: true}, (code, stdout, stderr) => {
            if (code === 0) {
                resolve({ code, stdout, stderr });
            }
            else {
                reject({ code, stdout, stderr });
            }
        });
    });
}