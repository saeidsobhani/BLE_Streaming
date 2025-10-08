// Simple BLE broadcasting for Accelerometer and Magnetometer on Bangle.js

var connected = false;

function onMag(d) {
  print("Mag:", d.x, d.y, d.z);
  if (connected) {
    NRF.updateServices({
      'f8b23a4d-89ad-4220-8c9f-d81756009f0c': {
        'f8b23a4d-89ad-4220-8c9f-d81756009f0e': {
          value: new Int32Array([d.x, d.y, d.z]).buffer,
          notify: true
        }
      }
    });
  }
}

function onAccel(d) {
  print("Accel:", d.x, d.y, d.z);
  if (connected) {
    NRF.updateServices({
      'f8b23a4d-89ad-4220-8c9f-d81756009f0c': {
        'f8b23a4d-89ad-4220-8c9f-d81756009f0d': {
          value: new Float32Array([d.x, d.y, d.z]).buffer,
          notify: true
        }
      }
    });
  }
}

function onInit() {
  // Enable sensors always for testing
  Bangle.setCompassPower(1);
  Bangle.setPollInterval(80); // 10ms for 100Hz
  
  /*
  Bangle.compassWr(0x31, 0x08); // Set mag to 100Hz ODR

  Configure accelerometer to 100Hz via I2C
  var i2c = new I2C();
  i2c.setup({scl:14, sda:15});
  i2c.writeTo(0x1E, [0x18, 0b00101100]);  // Enter standby mode
  i2c.writeTo(0x1E, [0x1B, 0x03]);        // Set ODCNTL to 100Hz
  i2c.writeTo(0x1E, [0x18, 0b10101100]);  // Return to active mode
  */

  NRF.on('connect', function() {
    connected = true;
  });
  
  NRF.on('disconnect', function() {
    connected = false;
    Bangle.setCompassPower(0);
  });

  NRF.setServices({
    'f8b23a4d-89ad-4220-8c9f-d81756009f0c': {
      'f8b23a4d-89ad-4220-8c9f-d81756009f0e': {
        description: 'Magnetometer',
        notify: true,
        readable: true,
        value: new Int32Array([0, 0, 0]).buffer
      },
      'f8b23a4d-89ad-4220-8c9f-d81756009f0d': {
        description: 'Accelerometer',
        notify: true,
        readable: true,
        value: new Float32Array([0, 0, 0]).buffer
      }
    }
  });

  // Advertise the service so it can be discovered
  NRF.setAdvertising({}, {
    name: "Bangle.js Sensor",
    services: ['f8b23a4d-89ad-4220-8c9f-d81756009f0c']
  });

  Bangle.on('mag', onMag);
  Bangle.on('accel', onAccel);
}

onInit();

