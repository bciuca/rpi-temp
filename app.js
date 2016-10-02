// For temp sensor DS18B20
// Edit `/boot/config.txt`
// Add the following line to the end of the file `dtoverlay=w1-gpio,gpiopin=27` <--- change GPIO as needed
// reboot
// sudo modprobe w1-gpio
// sudo modprobe w1-therm
// cat /sys/bus/w1/devices/{28-xxxxxxxxxx}/w1_slave   <--- the sensor serial number is unique


const fs = require('fs');

const SENSOR_1 = '28-8000002687a0';

function getTemp() {
    const output = fs.readFileSync(`/sys/bus/w1/devices/${SENSOR_1}/w1_slave`).toString();

    if (output.indexOf('YES') < 0) {
        console.warn(`Can't read sensor: ${SENSOR_1}`);
        return null;
    }

    const raw = parseInt(output.match(/t=(-?\d+)/)[1]);
    const c = raw / 1000;

    return {
        raw,
        c: c.toFixed(2),
        f: (c * 9/5 + 32).toFixed(2),
    };
}

setInterval(() => {
    const temp = getTemp();
    console.log(`${temp.f}°F ${temp.c}°C`);
}, 1000);
