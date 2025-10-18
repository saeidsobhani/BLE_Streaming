var connected = false; // Tracks whether a BLE central is currently connected

// Fixed-point scaling for compact Int16 streaming
var ACC_SCALE = 1000; // accelerometer: g -> mg (multiply by 1000)

// Turn on the magnetometer sensor (compass)
Bangle.setCompassPower(1);  // Enable magnetometer

// Configure the sensor poll interval.
Bangle.setPollInterval(10); // 80 ms for 12.5 Hz or 10 ms for 100 Hz
  
//  Configure magnetometer and accelerometer to 100 Hz
Bangle.compassWr(0x31, 0x08); // Set mag to 100 Hz ODR
var i2c = new I2C();
i2c.setup({scl:14, sda:15});
i2c.writeTo(0x1E, [0x18, 0b00101100]);  // Enter standby mode - change cntl1 register - output range +-4g
i2c.writeTo(0x1E, [0x1B, 0x03]);        // Set ODCNTL to 100 Hz
i2c.writeTo(0x1E, [0x18, 0b10101100]);  // Return to active mode - change cntl1 register

// Track BLE connection status
NRF.on('connect', function() {
  connected = true;
});
  
NRF.on('disconnect', function() {
  connected = false;
});

// Define a custom GATT service with two characteristics (Mag, Accel).
// 'readable: true' allows centrals to read the current value.
// 'notify: true' allows centrals to subscribe and receive updates automatically.
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': { // Custom service UUID
    'f26d62fe-3686-4241-ab06-0dad88068fae': { // Magnetometer characteristic UUID
      description: 'Magnetometer',
      notify: true,
      readable: true,
      value: new Int16Array([0, 0, 0]).buffer // 3 × int16 zeros as initial value
    },
    'f26d62fe-3686-4241-ab06-0dad88068fad': { // Accelerometer characteristic UUID
      description: 'Accelerometer',
      notify: true,
      readable: true,
      value: new Int16Array([0, 0, 0]).buffer // 3 × int16 zeros as initial value (acc scaled by ACC_SCALE)
    }
  }
}, { uart: true });

// Advertise the custom service so centrals can discover and connect.
NRF.setAdvertising({}, {
  name: "Bangle.js Sensor",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac'] // Include custom service UUID
});

// Magnetometer event handler
Bangle.on('mag', function(d) {
  print("Mag (decimal):", d.x, d.y, d.z); // Print magnetometer values to Espruino console - decimal- should multiply by 0.6 to get μT

  if (connected) {  // if central is connected
    // Push a notification to subscribed centrals by updating the characteristic value.
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': { // service UUID
        'f26d62fe-3686-4241-ab06-0dad88068fae': { // Magnetometer characteristic UUID
          value: new Int16Array([d.x, d.y, d.z]).buffer, // 3 × 2 bytes -> 6 bytes payload
          notify: true // Send as GATT Notification to subscribed centrals
        }
      }
    });
  }
});


// Accelerometer event handler.
Bangle.on('accel', function(d) {
  print("Accel (g):", d.x, d.y, d.z); // Print accelerometer values to Espruino console - g (gravitational acceleration)

  if (connected) {
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': { // service UUID
        'f26d62fe-3686-4241-ab06-0dad88068fad': { // Accelerometer characteristic UUID
          // Convert g to mg and pack as Int16 for compact, precise fixed-point
          value: new Int16Array([
            Math.round(d.x * ACC_SCALE),
            Math.round(d.y * ACC_SCALE),
            Math.round(d.z * ACC_SCALE)
          ]).buffer, // 3 × int16 -> 6 bytes payload
          notify: true // Send as GATT Notification to subscribed centrals
        }
      }
    });
  }
});

