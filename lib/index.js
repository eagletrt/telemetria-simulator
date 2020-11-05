const shell = require('shelljs')
const merge = require('deepmerge')
const util = require('util')
const fs = require('fs')

let canChild, gpsChild

let defaultConfig = {
    simulateCan: true,
    simulateGPS: true,
    can: {
        src: "./can.log",
        interface: "can0",
        iterations: Infinity,
        simulateTime: true,
        delay: 0
    },
    gps: {
        src: "./gps.txt",
        iterations: Infinity, //later
        simulateTime: true, //later
        delay: 0
    }
}

function stop () {
    if (canChild) canChild.kill("SIGINT")
    if (gpsChild) gpsChild.kill("SIGINT")
    //if (canChild) shell.exec(`kill ${canChild.pid} `)
    //if (gpsChild) shell.exec(`kill ${gpsChild.pid} `)
}

function start (config = {}) {

    process.once('SIGINT', stop)

    shell.echo("[EAGLETRT-TELEMETRIA-SIMULATOR]")
    shell.echo("[PID] " + process.pid)
    config = merge(defaultConfig, config)
    shell.echo("[CONFIG]\n" + util.inspect(config, depth=10, colorize=true))

    if (config.simulateCan) {
        if (!shell.which('canplayer')) {
            shell.echo('[CAN-ERROR] This script requires canplayer')
            shell.exit(1)
        } else {
            let _iterations, _simulateTime = ""
            if (config.can.iterations == Infinity) _iterations = "i"
            else _iterations = config.can.iterations.toString()
            if (!config.can.simulateTime) _simulateTime = "-t"
            setTimeout(()=> {
                shell.echo("[CAN] Starting CAN simulator")
                shell.echo("[CAN] Setting up CAN interface if not set")
                shell.exec(`modprobe vcan`)
                shell.exec(`echo -n "[CAN] " && ip link add dev ${config.can.interface} type vcan`)
                shell.exec(`ip link set up ${config.can.interface}`)
                shell.echo("[CAN] Using interface " + config.can.interface)
                canChild = shell.exec(`canplayer -l ${_iterations} -I ${config.can.src} ${_simulateTime}`, {async:true}, () => {
                    console.log("[CAN] Bye")
                })
                shell.echo("[CAN] Can player pid:" + canChild.pid)
            }, config.can.delay * 1000)
            
        }
    }

    if (config.simulateGPS) {
        if (!fs.existsSync("./simulator.out")) {
            shell.echo('[GPS-ERROR] This script requires simulator.out')
            shell.exit(1)
        } else {
            setTimeout(()=> {
                shell.echo("[GPS] Starting GPS simulator")
                gpsChild = shell.exec(`./simulator.out ${config.gps.src}`, {async:true}, () => {
                    console.log("[GPS] Bye")
                })
                shell.echo("[GPS] GPS player pid:" + gpsChild.pid)
            }, config.gps.delay * 1000)
        }
    }
}

module.exports = {
    start,
    stop
}