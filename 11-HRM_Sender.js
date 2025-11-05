var connected = false; // Tracks BLE connection status

Bangle.setHRMPower(1); // turn HRM on

// Track BLE connection status
NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });

// Define custom GATT service with one characteristic for HRM data
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fbd': {
      description: 'HRM Data',
      notify: true,
      readable: true,
      value: new Float32Array(2).buffer // [analogRead, hrm.raw]
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

// Send data at 50 Hz
setInterval(function() {
  var analog = analogRead(D29); // real floating point value
  var hrmRaw = latestHRMRaw; // HRM-raw value
  print("Sending: analogRead(D29) =", analog, ", HRM-raw =", hrmRaw);
  if (connected) {
    NRF.updateServices({
      'f26d62fe-3686-4241-ab06-0dad88068fbc': {
        'f26d62fe-3686-4241-ab06-0dad88068fbd': {
          value: new Float32Array([analog, hrmRaw]).buffer,
          notify: true
        }
      }
    });
  }
}, 20); // 20 ms interval = 50 Hz