var connected = false;
Bangle.setHRMPower(1); // turn HRM on

// Track BLE connection status
NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });

// Define custom GATT service with two characteristics: one for analog (200Hz), one for HRM (50Hz)
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fbd': {
      description: 'Analog raw',
      notify: true,
      readable: true,
      value: new Int8Array(1).buffer // One byte for analog reading (Int8)
    }
  }
}, { uart: true });

// Advertise the custom service
NRF.setAdvertising({}, {
  name: "Bangle.js Sensor",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});

// Send analog raw data at 100 Hz
setInterval(function() {
  var analog = analogRead(D29); // floating point value (unknown range)
  var analogScaled = Math.round(analog * 1000); // scale for better Int8 resolution
  analogScaled = Math.max(-128, Math.min(127, analogScaled)); // Clamp to Int8 range
  //print("Sending Analog: raw =", analog, ", scaled =", analogScaled);
  if (connected) {
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': {
        'f26d62fe-3686-4241-ab06-0dad88068fbd': {
          value: new Int8Array([analogScaled]).buffer,
          notify: true
        }
      }
    });
  }
}, 2); // 2 ms interval = 500 Hz