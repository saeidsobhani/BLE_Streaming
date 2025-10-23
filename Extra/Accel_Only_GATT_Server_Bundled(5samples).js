// Request fastest BLE connection interval (7.5ms)
NRF.setConnectionInterval(7.5, 7.5);

var connected = false; // Tracks BLE central connection
var ACC_SCALE = 1000; // accelerometer: g -> mg

Bangle.setPollInterval(10); // 10 ms for 100 Hz

// Configure accelerometer to 100 Hz (if needed)
var i2c = new I2C();
i2c.setup({scl:14, sda:15});
i2c.writeTo(0x1E, [0x18, 0b00101100]);  // Enter standby mode - output range +-4g
i2c.writeTo(0x1E, [0x1B, 0x03]);        // Set ODCNTL to 100 Hz
i2c.writeTo(0x1E, [0x18, 0b10101100]);  // Return to active mode

NRF.on('connect', function() {
  connected = true;
});
NRF.on('disconnect', function() {
  connected = false;
});



// Define a custom GATT service with one characteristic (Accel only, 8 samples bundled)
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fad': {
      description: 'Accelerometer',
      notify: true,
      readable: true,
      value: new Int16Array(24).buffer // 8 samples × 3 axes
    }
  }
}, { uart: true });

NRF.setAdvertising({}, {
  name: "Bangle.js Accel",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});



// Bundle 8 samples before sending
var sampleBuffer = new Int16Array(24); // 8 samples × 3 axes
var sampleIndex = 0;

Bangle.on('accel', function(d) {
  print("Accel (g):", d.x, d.y, d.z); // Print accelerometer values to Espruino console - g (gravitational acceleration)
  if (!connected) return;
  sampleBuffer[sampleIndex * 3 + 0] = Math.round(d.x * ACC_SCALE);
  sampleBuffer[sampleIndex * 3 + 1] = Math.round(d.y * ACC_SCALE);
  sampleBuffer[sampleIndex * 3 + 2] = Math.round(d.z * ACC_SCALE);
  sampleIndex++;
  if (sampleIndex >= 8) {
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': {
        'f26d62fe-3686-4241-ab06-0dad88068fad': {
          value: sampleBuffer.buffer,
          notify: true
        }
      }
    });
    sampleIndex = 0; // Reset for next batch
  }
});
