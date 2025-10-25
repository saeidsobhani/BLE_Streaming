//NRF.setConnectionInterval(7.5, 7.5);
var connected = false;

// Custom GATT service: 1 characteristic, 6 bytes (x, y, z)
NRF.setServices({
  'f26d62fe-3686-4241-ab06-0dad88068fac': {
    'f26d62fe-3686-4241-ab06-0dad88068fad': {
      description: 'Synthetic Accelerometer',
      notify: true,
      readable: true,
      value: new Int16Array(3).buffer // 3 axes × 2 bytes
    }
  }
}, { uart: true });

NRF.setAdvertising({}, {
  name: "Bangle.js Accel",
  services: ['f26d62fe-3686-4241-ab06-0dad88068fac']
});

NRF.on('connect', function() { connected = true; });
NRF.on('disconnect', function() { connected = false; });

function getSyntheticAccel() {
  var arr = new Int16Array(3);
  arr[0] = (Math.random() * 65536 - 32768) | 0;  // range -32768 to 32767
  arr[1] = (Math.random() * 65536 - 32768) | 0;
  arr[2] = (Math.random() * 65536 - 32768) | 0;
  //print(arr);
  return arr;
}

setInterval(function() {
  if (!connected) return;
  var data = getSyntheticAccel();
  NRF.updateServices({
    'f26d62fe-3686-4241-ab06-0dad88068fac': {
      'f26d62fe-3686-4241-ab06-0dad88068fad': {
        value: data.buffer,
        notify: true
      }
    }
  });
}, 3); // 4 ms interval = 250 Hz
