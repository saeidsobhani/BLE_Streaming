// Configure KX023 accelerometer to 100Hz via I2C
Bangle.setCompassPower(1);

Bangle.setPollInterval(10);

// Create I2C connection
var i2c = new I2C();
i2c.setup({scl:14, sda:15});

print("=== Starting Accelerometer Configuration ===");

// Step 1: Read current CNTL1
var cntl1 = i2c.readFrom(0x1E, 0x18, 1)[0];
print("Current CNTL1:", "0x" + cntl1.toString(16), "binary:", cntl1.toString(2));

// Step 2: Enter standby mode - Clear PC1 bit (bit 7)
print("\nEntering standby mode...");
i2c.writeTo(0x1E, [0x18, 0b00101100]);  // PC1 = 0
var cntl1_standby = i2c.readFrom(0x1E, 0x18, 1)[0];
print("CNTL1 in standby:", "0x" + cntl1_standby.toString(16), "binary:", cntl1_standby.toString(2));

// Step 3: Write ODCNTL to 0x03 (100Hz)
print("\nSetting ODCNTL to 0x03 for 100Hz...");
i2c.writeTo(0x1E, [0x1B, 0x03]);

// Step 4: Verify ODCNTL was written
var odcntl = i2c.readFrom(0x1E, 0x1B, 1)[0];
print("ODCNTL read back:", "0x" + odcntl.toString(16));

if (odcntl === 0x03) {
  print("✓ ODCNTL successfully set to 100Hz!");
} else {
  print("✗ ODCNTL write failed! Got:", "0x" + odcntl.toString(16));
}

// Step 5: Return to active mode
print("\nReturning to active mode...");
i2c.writeTo(0x1E, [0x18, 0b10101100]);  // PC1 = 1
var cntl1_active = i2c.readFrom(0x1E, 0x18, 1)[0];
print("CNTL1 in active:", "0x" + cntl1_active.toString(16), "binary:", cntl1_active.toString(2));

print("\n=== Configuration Complete ===\n");

// Step 6: Monitor accelerometer output
print("Monitoring accelerometer data...");
var count = 0;
var lastTime = Date.now();

Bangle.on('accel', function(d) {
  count++;
  var now = Date.now();
  var elapsed = now - lastTime;
  
  if (count % 10 === 0) {
    print("Accel #" + count + ":", d.x.toFixed(3), d.y.toFixed(3), d.z.toFixed(3), 
          "- Time since last 10:", elapsed + "ms", "Rate:", (10000/elapsed).toFixed(1) + "Hz");
    lastTime = now;
  }
});

print("Watching for 5 seconds...");
setTimeout(function() {
  print("\nTotal samples in 5 seconds:", count);
  print("Average rate:", (count/5).toFixed(1) + "Hz");
}, 5000);