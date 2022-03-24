[![Lint](https://github.com/eagletrt/telemetria-simulator/actions/workflows/lint.yml/badge.svg)](https://github.com/eagletrt/telemetria-simulator/actions/workflows/lint.yml)
[![Build](https://github.com/eagletrt/telemetria-simulator/actions/workflows/build.yml/badge.svg)](https://github.com/eagletrt/telemetria-simulator/actions/workflows/build.yml)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![License](https://img.shields.io/npm/l/@eagletrt/telemetria-simulator.svg)](https://github.com/eagletrt/telemetria-simulator/blob/master/LICENSE)
[![Types](https://img.shields.io/npm/types/@eagletrt/telemetria-simulator.svg)](https://www.npmjs.com/package/@eagletrt/telemetria-simulator)

# eagletrt-telemetria-simulator
From a CAN and/or GPS log, simulates the contained messages into the local environment [@eagletrt](https://www.github.com/eagletrt).

## Project purpose

This project is an **npm** package made for the **telemetry** of eagletrt. The telemetry consists in a **c program** located in a **Raspberry Pi** and attached to the canbus of the car and to a rover-gps. Its job is reading all the sensors **messages**, forwarding them via mqtt and saving them in a local mongodb database. Some **can** and **gps** raw **logs** are also saved by the telemetry. The purpose of this project is having a tool that given those **raw logs**, reproduces them in the local environment, especially for testing purposes.

## How it was made

This project was made with **typescript** and consists in an npm module that can be used also **globally**, as a terminal command. It is linted with **eslint**, bundled with **webpack**, documented with **typedoc** and checked by some **github actions**.

## How does it work

The library gets as inputs a **can** and/or **gps** raw log. It is very highly conigurable, but roughly what it does is reading those files and reproducing the events it reads, by emitting events in the CANbus (virtual or real) and USB virtual serial ports.

## How to use it

This module can be actually used both as a **local** and as a **global** npm module.

### As a local module

Install the module executing:

```bash
$ npm install --save @eagletrt/telemetria-simulator
```

Virtualize a can interface

```javascript
const telemetriaSimulator = require('@eagletrt/telemetria-simulator');

async function main() {
    await telemetriaSimulator.virtualizeCan('vcan0', { silent: true });
}
main();
```

Simulate from a CAN log

```javascript
const telemetriaSimulator = require('@eagletrt/telemetria-simulator');

async function main() {
    const canSimulatorInstance = await simulateCan('./can.log', {
        iterations: 100,
        silent: true,
        canInterface: 'vcan0'
    });
    await canSimulatorInstance.waitUntilFinished();
}
main();
```

Simulate from a GPS log

```javascript
const telemetriaSimulator = require('@eagletrt/telemetria-simulator');

async function main() {
    const gpsSimulatorInstance = await simulateGps('./gps.ubx', {
        iterations: 100,
        silent: true,
        simulateTime: true,
        delay: 230
    });
    console.log(await gpsSimulatorInstance.getGpsInterface());
    await gpsSimulatorInstance.waitUntilFinished();
}
main();
```

To see all the options, refer to the **api**.

### As a global module

Install the module with:

```bash
$ npm install -g @eagletrt/telemetria-simulator
```

Executing:

```bash
$ eagletrt-simulator virtualize can
$ eagletrt-simulator simulate can
$ eagletrt-simulator simulate gps
$ eagletrt-simulator simulate all
```

Will have the same results as the examples with the local module.

The options are almost the same as in the **api** of the local module. To see all the cli options, run:

```bash
$ eagletrt-simulator --help
```

## API

### virtualizeCan

**Syntax:**

`virtualizeCan(canInterface, options)`

**Description:**

Virtualizes a canbus interface.

**Parameters:**

* __canInterface__: The name of the interface that is to be virtualized. It is a `string` and the default value is `can0`.
* __options__: The *VirtualizeCanOptions* passed to customize the behaviour.

**Returns:**

It returns a promise to the string `virtualized` if it is succesfully virtualized or `already_virtualized` if it were already virtualized.

**Options:**

* __silent__: Default value `false`. If true, the log will not be shown.


### simulateCan

**Syntax:**

`simulateCan(src, options)`

**Description:**

Simulates some data sent via a virtualized canbus interface. The data comes from a can log, that can be obtained through tools such as candump.

**Parameters:**

* __src__: The path to the can log file containing the messages that will be sent over the virtualized canbus. The default value is a can log file already stored in this npm package. If some options are wanted to be specified, but also using the default src file, use null as this value.
* __options__: The *SimulateCanOptions* passed to customize the behaviour.

**Returns:**

It returns a promise to a *CanSimulatorInstance* that can be used to wait until the simulation is finished.

**Options:**

* __canInterface__: The name of the interface that is to be virtualized. It is a `string` and the default value is `can0`.
* __iterations__: The number of times that the can log file will be sent over the can. It is a `number` and the default value is `Infinity`.
* __silent__: If true, the log will not be shown. It is a `boolean` and the default value is `true`.
* __simulateTime__: If the delta timestamps specified for each message in the can log file will be taken in consideration and simulated. It is a `boolean` and the default value is `true`.

**Methods of the returned instance**

* __stop()__: Stops the process if it has not already finished. It returns a promise to `void`.
* __waitUntilFinished(timeout?: null | number)__: Waits until the can simulator has finished or an optional-specified timeout (in milliseconds)  has expired. It returns a promise to a `boolean` which is true if the simulator has finished and false otherwise.

### processLogsForTest

**Syntax:**

`simulateGps(src, options)`

**Description:**

Simulates some data sent via a virtualized gps serial port. The data comes from a gps ubx log.

**Parameters:**

* __src__: The path to the gps log file containing the messages that will be sent over the virtualized serial port. The default value is a gps log file already stored in this npm package. If some options are wanted to be specified, but also using the default src file, use null as this value.
* __options__: The *SimulateGpsOptions* passed to customize the behaviour.

**Returns:**

It returns a promise to a *GpsSimulatorInstance* that can be used to wait until the simulation is finished.

**Options:**

* __delay__: The number of milliseconds that the gps simulator will wait after opening the gps pseudoterminal port interface and before sending the messages over that interface. It is a `number` and the default value is `0`.
* __iterations__: The number of times that the gps ubx log file will be sent over the serial port. It is a `number` and the default value is `Infinity`.
* __keepAlive__: If true, the process will be kept alive after having sent all the simulated gps data. It is a `boolean` and the default value is `false`.
* __silent__: If true, the log will not be shown. It is a `boolean` and the default value is `true`.
* __simulateTime__: If the delta timestamps specified for each message in the gps ubx log file will be taken in consideration and simulated. It is a `boolean` and the default value is `true`.

**Methods of the returned instance**

* __getGpsInterface()__: Returns the gps interface if it is already defined, or waits for the gps simulator output to print it and returns it after detecting that output. It returns a promise to a `string`.
* __stop()__: Stops the process if it has not already finished. It returns a promise to `void`.
* __waitUntilFinished(timeout?: null | number)__: Waits until the gps simulator has finished or an optional-specified timeout (in milliseconds) has expired. It returns a promise to a `boolean` which is true if the simulator has finished and false otherwise.

## Where was it used

This module was used in the telemetry sender [repo](https://github.com/eagletrt/telemetria-sender) of eagletrt. It is also included in the eagle-cli.

## Notes

Note that this module uses **yargs** for the cli and the yargs commands and options are **modular**: this means that they can be imported and used by other modules that consists in a cli and wrap this library, such as the **eagle-cli**.

The GPS simulator is written in C and compiled during installation. If this does not happen, there is a script in the `package.json` exactly to do it. The C program is valid only on Linux.

A default can log and a default gps log are already included in this package.

## Build

To build for production, using webpack:

```bash
npm run bundle
```
