var connected = false; // Tracks whether a BLE central is currently connected
var ACC_SCALE = 1000; // accelerometer: g -> mg
Bangle.setPollInterval(10); // Configure the sensor poll interval = 100 Hz

//  Configure accelerometer ODR to 100 Hz
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

// Define a custom GATT service with one characteristic
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': { // Custom service UUID
    'f26d62fe-3686-4241-ab06-0dad88068fad': { // Accelerometer characteristic UUID
      description: 'Accelerometer',
      notify: true,
      readable: true,
      value: new Int16Array([0, 0, 0]).buffer // 3 × int16 zeros as initial value
    }
  }
}, { uart: true });

// Advertise the custom service
NRF.setAdvertising({}, {
  name: "Bangle.js Sensor",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});


// Accelerometer event handler.
Bangle.on('accel', function(d) {
  print("Accel (g):", d.x, d.y, d.z); // Unit: g (gravitational acceleration)

  if (connected) {
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': { // service UUID
        'f26d62fe-3686-4241-ab06-0dad88068fad': { // Accelerometer characteristic UUID
          // Convert g to mg and pack as Int16
          value: new Int16Array([
            Math.round(d.x * ACC_SCALE),
            Math.round(d.y * ACC_SCALE),
            Math.round(d.z * ACC_SCALE)
          ]).buffer, // 3 × int16 -> 6 bytes payload
          notify: true
        }
      }
    });
  }
});