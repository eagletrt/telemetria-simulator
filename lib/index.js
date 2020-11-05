const shell = require('shelljs')
const merge = require('deepmerge')
const util = require('util')
const fs = require('fs')

let defaultConfig = {
    simulateCan: true,
    simulateGPS: true,
    can: {
        src: "./can.log",
        interface: "can0",
        iterations: Infinity,
        simulateTime: true,
        delay: 0 //later
    },
    gps: {
        src: "./gps.txt",
        iterations: Infinity, //later
        simulateTime: true, //later
        delay: 0 //later
    }
}

module.exports = (config = {}) => {

    process.on('SIGINT', () => {
        shell.echo("\n")
        shell.exec("killall canplayer") //not found as output is normal: i checked
        shell.exec("killall simulator.out") //not found as output is normal: i checked
        shell.echo("[BYE]")
    })

    /*setTimeout(() => {
        shell.exec("killall canplayer")
        shell.exec("killall simulator.out")
    }, 3000)*/

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
            //all shell exec are by default synchronous
            shell.echo("[CAN] Starting CAN simulator")
            shell.echo("[CAN] Setting up CAN interface if not set")
            shell.exec(`modprobe vcan`)
            shell.exec(`echo -n "[CAN] " && ip link add dev ${config.can.interface} type vcan`)
            shell.exec(`ip link set up ${config.can.interface}`)
            shell.echo("[CAN] Using interface " + config.can.interface)
            shell.exec(`canplayer -l ${_iterations} -I ${config.can.src} ${_simulateTime}`, {async:true})
            /*if (shell.exec(`./can.sh ${config.can.src} ${config.can.interface} ${_iterations}`).code !== 0) {
                shell.echo('Error: Git commit failed');
                shell.exit(1);
            }*/
        }
    }

    if (config.simulateGPS) {
        if (!fs.existsSync("./simulator.out")) {
            shell.echo('[GPS-ERROR] This script requires simulator.out')
            shell.exit(1)
        } else {
            shell.echo("[GPS] Starting GPS simulator")
            shell.exec(`./simulator.out ${config.gps.src}`, {async:true})
        }
    }
}