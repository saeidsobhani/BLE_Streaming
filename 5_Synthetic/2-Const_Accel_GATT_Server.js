var connected = false;

NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fad': {
      description: '8x INT16 Bundle',
      notify: true,
      readable: true,
      value: new Int16Array(24).buffer // 48 bytes (8 samples × 3 axes × 2 bytes)
    }
  }
}, { uart: true });

NRF.setAdvertising({}, {
  name: "Bangle.js Accel",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});

NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });

// Predefined 48-byte buffer (8 samples × 3 axes INT16)
var fastBuffer = new Int16Array([
  420, -990, 1700,   // Sample 1
  421, -989, 1701,   // Sample 2
  422, -988, 1702,   // Sample 3
  423, -987, 1703,   // Sample 4
  424, -986, 1704,   // Sample 5
  425, -985, 1705,   // Sample 6
  426, -984, 1706,   // Sample 7
  427, -983, 1707    // Sample 8
]);

function sendBundles() {
  if (!connected) {
    setTimeout(sendBundles, 100);
    return;
  }
  NRF.updateServices({
    'f26d62fe-3686-4241-ab06-0dad88068fac': {
      'f26d62fe-3686-4241-ab06-0dad88068fad': {
        value: fastBuffer.buffer,
        notify: true
      }
    }
  });
  setTimeout(sendBundles, 0);
}

sendBundles();
