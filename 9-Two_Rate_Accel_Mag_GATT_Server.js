var connected = false; // Tracks BLE connection status
Bangle.setCompassPower(1); // Enable magnetometer
Bangle.compassWr(0x31, 0x08);
Bangle.setPollInterval(10); // Configure sensor poll interval to 100 Hz

// Configure accelerometer ODR to 200 Hz and enable FIFO 8-bit mode
var i2c = new I2C();
i2c.setup({scl:14, sda:15});
i2c.writeTo(0x1E, [0x18, 0b00101100]); // Enter standby mode - output range +-4g
i2c.writeTo(0x1E, [0x1B, 0x04]);       // Set ODCNTL to 200 Hz
i2c.writeTo(0x1E, [0x3B, 0b10000001]); // Set BUF_CNTL2 to 8-bit MSB samples in buffer
i2c.writeTo(0x1E, [0x18, 0b10101100]); // Return to active mode

// Track BLE connection status
NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });

// Define custom GATT service with two characteristics
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fae': {
      description: 'Magnetometer',
      notify: true,
      readable: true,
      value: new Int16Array(3).buffer
    },
    'f26d62fe-3686-4241-ab06-0dad88068fad': {
      description: 'Accelerometer',
      notify: true,
      readable: true,
      value: new Uint8Array(48).buffer
    }
  }
}, { uart: true });

// Advertise the custom service
NRF.setAdvertising({}, {
  name: "Bangle.js Sensor",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});

// Magnetometer event handler
var magArr = new Int16Array(3);
Bangle.on('mag', function(d) {
  if (connected) {
    magArr[0] = d.x;
    magArr[1] = d.y;
    magArr[2] = d.z;
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': {
        'f26d62fe-3686-4241-ab06-0dad88068fae': {
          value: magArr.buffer, // 3 × 2 bytes -> 6 bytes payload
          notify: true
        }
      }
    });
  }
});

// Accelerometer polling at 200 Hz (every 5 ms) using FIFO (8-bit resolution)
setInterval(function() {
  var buf = Bangle.accelRd(0x3F, 48); // Read 48 bytes from BUF_READ (FIFO)
  if (buf && buf.length === 48 && connected) {
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': {
        'f26d62fe-3686-4241-ab06-0dad88068fad': {
          value: buf.buffer, // Send 48 bytes in one notification
          notify: true
        }
      }
    });
  }
}, 80); // 16*5ms interval = 80ms for 200 Hz