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
  Bangle.setPollInterval(10); // 10ms for 100Hz
  Bangle.compassWr(0x31, 0x08); // Set mag to 100Hz ODR

  // Configure accelerometer ODR to 100Hz via I2C
  // Create a new I2C object and set up the pins.
  var i2c = new I2C();
  i2c.setup({scl:14, sda:15});

  // Read CNTL1 register (0x18) to get the current value.
  var cntl1 = i2c.readFrom(0x1E, 0x18, 1)[0];

  // Clear the PC1 bit (Bit 7) to enter standby mode.
  cntl1 &= ~(1 << 7); 
  i2c.writeTo(0x1E, [0x18, cntl1]);

  // Write the correct value (0x03) to ODCNTL register (0x1B) to set ODR to 100Hz.
  i2c.writeTo(0x1E, [0x1B, 0x03]);
  
  // Read back to verify
  var odcntl = i2c.readFrom(0x1E, 0x1B, 1)[0];
  print("ODCNTL read back:", odcntl.toString(16));
  
  // Set the PC1 bit (Bit 7) back to 1 to return to active mode.
  cntl1 |= (1 << 7);
  i2c.writeTo(0x1E, [0x18, cntl1]);

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

  // Since 'accel' event doesn't work with changed ODR, use interval to poll
  setInterval(() => {
    var a = Bangle.getAccel();
    onAccel(a);
  }, 10);

  // Since 'mag' event may not work reliably, use interval to poll
  setInterval(() => {
    var m = Bangle.getCompass();
    onMag(m);
  }, 10);

  // Comment out the event listener
  // Bangle.on('mag', onMag);
}

onInit();

