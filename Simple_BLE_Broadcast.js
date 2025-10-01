// Simple BLE broadcasting for Accelerometer and Magnetometer on Bangle.js
// Upload this code to the watch via Espruino IDE

var connected = false;

function onMag(d) {
  print("Mag:", d.x, d.y, d.z);
  if (connected) {
    NRF.updateServices({
      'f8b23a4d-89ad-4220-8c9f-d81756009f0c': {
        'f8b23a4d-89ad-4220-8c9f-d81756009f0c': {
          value: new Int32Array([d.x, d.y, d.z]).buffer,
          notify: true
        }
      }
    });
  }
}

function onAccel(d) {
  print("Accel:", d.x, d.y, d.z);
  if (connected) {
    NRF.updateServices({
      'f8b23a4d-89ad-4220-8c9f-d81756009f0c': {
        'f8b23a4d-89ad-4220-8c9f-d81756009f0d': {
          value: new Float32Array([d.x, d.y, d.z]).buffer,
          notify: true
        }
      }
    });
  }
}

function onInit() {
  // Enable sensors always for testing
  Bangle.setCompassPower(1);
  Bangle.setPollInterval(10); // 10ms for 100Hz
  Bangle.compassWr(0x31, 0x08); // Set mag to 100Hz ODR
  
  NRF.on('connect', function() {
    connected = true;
  });
  
  NRF.on('disconnect', function() {
    connected = false;
    Bangle.setCompassPower(0);
  });

  NRF.setServices({
    'f8b23a4d-89ad-4220-8c9f-d81756009f0c': {
      'f8b23a4d-89ad-4220-8c9f-d81756009f0c': {
        description: 'Magnetometer',
        notify: true,
        readable: true,
        value: new Int32Array([0, 0, 0]).buffer,
        writable: true,
        onWrite: function(evt) {
          var d = evt.data && evt.data[0];
          if ([80, 40, 20, 10, 5].indexOf(d) >= 0) {
            Bangle.setPollInterval(1000 / d);
          }
        }
      },
      'f8b23a4d-89ad-4220-8c9f-d81756009f0d': {
        description: 'Accelerometer',
        notify: true,
        readable: true,
        value: new Float32Array([0, 0, 0]).buffer
      }
    }
  });

  Bangle.on('accel', onAccel);
  Bangle.on('mag', onMag);
}

onInit();
