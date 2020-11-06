export * from './modules/virtualizeCan';
export * from './modules/simulateCan';
export * from './modules/simulateGps';

import { simulateGps } from './modules/simulateGps';

async function main() {
    try {
        const gpsInstance = await simulateGps(null, {
            silent: false
        });
        setTimeout(async () => {
            await gpsInstance.stop();
        }, 10000);
    }
    catch (error) {
        console.log(error);
    }
}
main();