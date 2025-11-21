var connected = false; // Tracks BLE connection status

var i2c = new I2C();
i2c.setup({scl:14, sda:15});
i2c.writeTo(0x1E, [0x18, 0b00101100]); // Enter standby mode - output range +-4g
i2c.writeTo(0x1E, [0x1B, 0x07]);       // Set ODCNTL to have 1600 Hz ODR
i2c.writeTo(0x1E, [0x3A, 0x30]);       // Set BUF_CNTL1 sample threshold = 48 bytes (16 samples) 
i2c.writeTo(0x1E, [0x3B, 0b10100000]); // BUF_CNTL2: BUFE=1(active) / BUF_RES=0(8-bit MSB) / BFIE=1(Buffer interupt update in INS2) / FIFO Mode
i2c.writeTo(0x1E, [0x18, 0b10101100]); // Return to active mode

// Track BLE connection status
NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });

// Define custom GATT service with one characteristic for accelerometer
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
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

// Poll STATUS_REG to check for interrupt
setInterval(function() {
  var statusReg = i2c.readFrom(0x1E, 0x15, 1)[0]; // Read STATUS_REG
  if (statusReg & 0x10) { // Check if INT bit is set

    // Read 48 bytes from FIFO buffer
    var buf = Bangle.accelRd(0x3F, 48);
    
    // Reading FIFO automatically clears WMI in INS2 and INT in STATUS_REG
    if (buf && connected) {
      NRF.updateServices({
        'f26d62fe-3686-4241-ab06-0dad88068fac': {
          'f26d62fe-3686-4241-ab06-0dad88068fad': {
            value: buf.buffer, // Send 48 bytes in one notification
            notify: true
          }
        }
      });
    }
  }
}, 10); // Every 10ms