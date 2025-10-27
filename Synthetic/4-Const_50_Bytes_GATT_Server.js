
//NRF.setConnectionInterval(7.5, 7.5); // Fastest BLE interval
var connected = false;

NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fad': {
      description: 'Fastest 50 Bytes',
      notify: true,
      readable: true,
      value: new Uint8Array(50).buffer
    }
  }
}, { uart: true });

NRF.setAdvertising({}, {
  name: "Bangle.js Max",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});

NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });

// Predefined 50-byte buffer with non-sequential values
var fastBuffer = new Uint8Array([
  37, 201, 56, 142, 5, 88, 173, 44, 99, 230,
  17, 154, 63, 212, 81, 7, 190, 121, 33, 76,
  205, 11, 134, 222, 68, 159, 24, 199, 53, 146,
  39, 178, 92, 13, 240, 61, 128, 185, 72, 109,
  251, 29, 116, 167, 48, 137, 221, 84, 195, 10
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
