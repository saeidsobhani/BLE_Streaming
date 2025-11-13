var connected = false; // Tracks whether a BLE central is currently connected
var ACC_SCALE = 1000; // accelerometer: g -> mg (multiply by 1000)

Bangle.setCompassPower(1);  // Enable magnetometer
Bangle.setPollInterval(10); // 10 ms for 100 Hz

// Enable magnetometer
Bangle.compassWr(0x31, 0x08); // Set mag to 100 Hz ODR
var i2c = new I2C();
i2c.setup({scl:14, sda:15});
i2c.writeTo(0x1E, [0x18, 0b00101100]);  // Enter standby mode - output range +-4g
i2c.writeTo(0x1E, [0x1B, 0x03]);        // Set ODCNTL to 100 Hz
i2c.writeTo(0x1E, [0x18, 0b10101100]);  // Return to active mode

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
    'f26d62fe-3686-4241-ab06-0dad88068fae': { // Combined characteristic UUID
      description: 'Acc+Mag',
      notify: true,
      readable: true,
      value: new Int16Array([0, 0, 0, 0, 0, 0]).buffer // Single sample (6 int16 values = 12 bytes)
    }
  }
}, { uart: true });

// Keep latest sensor values - MUST be declared before function uses them
var lastAccel = [0, 0, 0]; // mg (scaled)
var lastMag   = [0, 0, 0]; // raw LSB

var payloadBuffer = new Int16Array(6); // Allocate once: [ax, ay, az, mx, my, mz]

function sendNotification() {
  if (!connected) return;
  
  payloadBuffer[0] = lastAccel[0];
  payloadBuffer[1] = lastAccel[1];
  payloadBuffer[2] = lastAccel[2];
  payloadBuffer[3] = lastMag[0];
  payloadBuffer[4] = lastMag[1];
  payloadBuffer[5] = lastMag[2];

  // Send notification immediately (no bundling)
  NRF.updateServices({
    'f26d62fe-3686-4241-ab06-0dad88068fac': {
      'f26d62fe-3686-4241-ab06-0dad88068fae': {
        value: payloadBuffer.buffer,
        notify: true
      }
    }
  });
}

// Advertise the custom service so centrals
NRF.setAdvertising({}, {
  name: "Bangle.js Sensor",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac'] // Include custom service UUID
});

// Magnetometer event handler
Bangle.on('mag', function(d) {
  print("Mag (decimal):", d.x, d.y, d.z); //Unit: decimal- should multiply by 0.6 to get μT
  lastMag[0] = d.x;
  lastMag[1] = d.y;
  lastMag[2] = d.z;
});

// Accelerometer event handler (drives the sampling)
Bangle.on('accel', function(d) {
  print("Accel (g):", d.x, d.y, d.z); // Unit: g (gravitational acceleration)
  lastAccel[0] = Math.round(d.x * ACC_SCALE);
  lastAccel[1] = Math.round(d.y * ACC_SCALE);
  lastAccel[2] = Math.round(d.z * ACC_SCALE);
  
  // Send immediately without bundling
  sendNotification();
});

