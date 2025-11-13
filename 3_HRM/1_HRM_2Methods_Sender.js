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
      value: new Int16Array(1).buffer // Two bytes for analog reading (Int16)
    },
    'f26d62fe-3686-4241-ab06-0dad88068fbe': {
      description: 'HRM.raw',
      notify: true,
      readable: true,
      value: new Int8Array(1).buffer // Single byte for HRM-raw (-128 to 127)
    }
  }
}, { uart: true });

// Advertise the custom service
NRF.setAdvertising({}, {
  name: "Bangle.js Sensor",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});

// Store latest HRM-raw value
var latestHRMRaw = 0;
Bangle.on('HRM-raw', function(hrm) {
  latestHRMRaw = hrm.raw;
});

// Send analog raw data at 100 Hz
setInterval(function() {
  var analog = analogRead(D29); // floating point value (unknown range)
  var analogScaled = analog * 10000;
  analogScaled = Math.max(-32768, Math.min(32767, analogScaled | 0)); // Clamp to Int16 range
  //print("Sending Analog: raw =", analog, ", scaled =", analogScaled);
  if (connected) {
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': {
        'f26d62fe-3686-4241-ab06-0dad88068fbd': {
          value: new Int16Array([analogScaled]).buffer,
          notify: true
        }
      }
    });
  }
}, 10); // 10 ms interval = 100 Hz

// Send HRM.raw at 50 Hz
setInterval(function() {
  var hrmRaw = latestHRMRaw; // HRM-raw value (already in -128 to 127 range)
  //print("Sending HRM: raw =", hrmRaw);
  if (connected) {
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fac': {
        'f26d62fe-3686-4241-ab06-0dad88068fbe': {
          value: new Int8Array([hrmRaw]).buffer,
          notify: true
        }
      }
    });
  }
}, 20); // 20 ms interval = 50 Hz