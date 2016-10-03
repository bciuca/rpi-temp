// For temp sensor DS18B20 on raspberry pi
// Edit `/boot/config.txt`
// Add the following line to the end of the file `dtoverlay=w1-gpio,gpiopin=27` <--- change GPIO as needed
// reboot
// sudo modprobe w1-gpio
// sudo modprobe w1-therm
// cat /sys/bus/w1/devices/{28-xxxxxxxxxx}/w1_slave   <--- the sensor serial number is unique


const fs = require('fs');
const Gpio = require('onoff').Gpio;

const SENSOR_1 = '28-8000002687a0';
const RELAY_GPIO_PIN = 17;
const RELAY_GPIO = new Gpio(RELAY_GPIO_PIN, 'out');

var relayValue = null;

function getTemp() {
    const output = fs.readFileSync(`/sys/bus/w1/devices/${SENSOR_1}/w1_slave`).toString();

    if (output.indexOf('YES') < 0) {
        console.warn(`Can't read sensor: ${SENSOR_1}`);
        return null;
    }

    const raw = parseInt(output.match(/t=(-?\d+)/)[1]);
    
    if (isNaN(raw)) {
        console.warn(`Can't read temperature from output: ${output}`);
        return null;
    }
    
    const c = raw / 1000;

    return {
        raw,
        c: c.toFixed(2),
        f: (c * 9/5 + 32).toFixed(2),
    };
}

function setRelayValue(value) {
    if (relayValue === value) {
        return;
    }
    relayValue = value;

    console.log(`Setting GPIO ${RELAY_GPIO_PIN} to ${value}`);
    
    RELAY_GPIO.writeSync(relayValue);
}

setInterval(() => {
    const temp = getTemp();
    console.log(`${temp.f}°F ${temp.c}°C`);

    if (temp.f > 75) {
        setRelayValue(1);
    } 
    else {
        setRelayValue(0);
    }
}, 1000);
