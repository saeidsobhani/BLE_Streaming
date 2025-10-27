//NRF.setConnectionInterval(7.5, 7.5); // Fastest BLE interval
var connected = false;

NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fad': {
      description: 'Fastest 6 Byte',
      notify: true,
      readable: true,
      value: new Uint8Array(6).buffer // 6 bytes
    }
  }
}, { uart: true });

NRF.setAdvertising({}, {
  name: "Bangle.js Accel",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});

NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });

// Predefined 6-byte buffer for fastest sending
var fastBuffer = new Uint8Array([42, 99, 17, 88, 203, 7]);

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
