var connected = false; // Tracks whether a BLE central is currently connected
var ACC_SCALE = 1000; // accelerometer: g -> mg (multiply by 1000)

Bangle.setCompassPower(1);  // Enable magnetometer
Bangle.setPollInterval(10); // 10 ms for 100 Hz

// Enable magnetometer
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

// Define a custom GATT service with one combined characteristic (Accel + Mag)
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': { // Custom service UUID
    'f26d62fe-3686-4241-ab06-0dad88068fab': { // Combined characteristic UUID
      description: 'Accel+Mag',
      notify: true,
      readable: true,
      value: new Int16Array(24).buffer // Initial buffer for 4 samples (24 int16 values = 48 bytes)
    }
  }
}, { uart: true });

// Buffer to collect samples before sending
var sampleBuffer = []; // Array to hold samples

function addSample(lastAccel, lastMag) {
  if (!connected) return;
  
  sampleBuffer.push({
    accel: [lastAccel[0], lastAccel[1], lastAccel[2]],
    mag: [lastMag[0], lastMag[1], lastMag[2]]
  });
  if (sampleBuffer.length >= 4) {
    sendBundledNotification();
  }
}

function sendBundledNotification() { 
  if (sampleBuffer.length < 4) return;
  
  // Pre-allocate payload buffer for 4 samples (24 values)
  var payload = new Int16Array(24);
  
  var idx = 0;
  for (var i = 0; i < 4; i++) {
    var sample = sampleBuffer[i];
    payload[idx++] = sample.accel[0];
    payload[idx++] = sample.accel[1];
    payload[idx++] = sample.accel[2];
    payload[idx++] = sample.mag[0];
    payload[idx++] = sample.mag[1];
    payload[idx++] = sample.mag[2];
  }
  
  // Send notification
  NRF.updateServices({
    'f26d62fe-3686-4241-ab06-0dad88068fac': {
      'f26d62fe-3686-4241-ab06-0dad88068fab': {
        value: payload.buffer,
        notify: true
      }
    }
  });
  
  // Clear buffer
  sampleBuffer = [];
}

// Advertise the custom service so centrals can discover and connect.
NRF.setAdvertising({}, {
  name: "Bangle.js Sensor",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac'] // Include custom service UUID
});

// Keep latest sensor values
var lastAccel = [0, 0, 0]; // mg (scaled)
var lastMag   = [0, 0, 0]; // raw LSB

// Magnetometer event handler
Bangle.on('mag', function(d) {
  print("Mag (decimal):", d.x, d.y, d.z); // Print magnetometer values to Espruino console - decimal- should multiply by 0.6 to get μT
  lastMag[0] = d.x;
  lastMag[1] = d.y;
  lastMag[2] = d.z;
});

// Accelerometer event handler (drives the sampling)
Bangle.on('accel', function(d) {
  print("Accel (g):", d.x, d.y, d.z); // Print accelerometer values to Espruino console - g (gravitational acceleration)
  lastAccel[0] = Math.round(d.x * ACC_SCALE);
  lastAccel[1] = Math.round(d.y * ACC_SCALE);
  lastAccel[2] = Math.round(d.z * ACC_SCALE);
  
  addSample(lastAccel, lastMag);
});

