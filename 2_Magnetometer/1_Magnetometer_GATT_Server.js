var connected = false; // Tracks whether a BLE central is currently connected
Bangle.setCompassPower(1);  // Enable magnetometer
Bangle.setPollInterval(10);// Configure the sensor poll interval.

//  Configure magnetometer ODR to 100 Hz
Bangle.compassWr(0x31, 0x08);

// Track BLE connection status
NRF.on('connect', function() {
  connected = true;
});
  
NRF.on('disconnect', function() {
  connected = false;
});

// Define a custom GATT service with two characteristics
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': { // Custom service UUID
    'f26d62fe-3686-4241-ab06-0dad88068fae': { // Magnetometer characteristic UUID
      description: 'Magnetometer',
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

// Magnetometer event handler
Bangle.on('mag', function(d) {
  //print("Mag (decimal):", d.x, d.y, d.z); // Unit: decimals that must multiplied by 0.6 to get microtesla (µT)
  if (connected) {
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