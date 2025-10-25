//NRF.setConnectionInterval(7.5, 7.5); // Fastest BLE interval
var connected = false;

// Custom GATT service: 1 characteristic, 48 bytes (8 samples × 3 axes × 2 bytes)
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fad': {
      description: 'Synthetic Accelerometer Bundled',
      notify: true,
      readable: true,
      value: new Int16Array(24).buffer // 8 samples × 3 axes
    }
  }
}, { uart: true });

NRF.setAdvertising({}, {
  name: "Bangle.js Accel",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});

NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });


function getSyntheticAccelBundle() {
  var arr = new Int16Array(24); // 8 samples × 3 axes
  for (var i = 0; i < 24; i++) {
    arr[i] = (Math.random() * 65536 - 32768) | 0;
  }
  return arr;
}


function sendBundles() {
  if (!connected) {
    setTimeout(sendBundles, 100);
    return;
  }
  var sampleBuffer = getSyntheticAccelBundle();
  NRF.updateServices({
    'f26d62fe-3686-4241-ab06-0dad88068fac': {
      'f26d62fe-3686-4241-ab06-0dad88068fad': {
        value: sampleBuffer.buffer,
        notify: true
      }
    }
  });
  setTimeout(sendBundles, 0);
}

sendBundles();
