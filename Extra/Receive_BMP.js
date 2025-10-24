// Set up a custom BLE service and characteristic for receiving image data
NRF.setServices({
  "2fa08204-bcaa-424f-bd6c-cebddcf73cc3": {
    "2fa08204-bcaa-424f-bd6c-cebddcf73cc4": {
      writable: true,
      maxLen: 14400, // 240x240 pixels * 2 bits / 8 for packed 2-bit
      onWrite: function(evt) {
        // evt.data is a Uint8Array containing the packed 2-bit frame data
        // Each byte contains 4 pixels (2 bits each)
        var img = [];
        var idx = 0;
        for (var y = 0; y < 240; y++) {
          img[y] = [];
          for (var x = 0; x < 240; x++) {
            var byteIndex = Math.floor(idx / 4);
            var bitOffset = (idx % 4) * 2;
            var val = (evt.data[byteIndex] >> (6 - bitOffset)) & 0x03;
            // Scale 2-bit value (0-3) to 0-255
            img[y][x] = val * 85;
            idx++;
          }
        }
        // Display the image
        g.clear();
        for (var y = 0; y < 240; y++) {
          for (var x = 0; x < 240; x++) {
            var c = img[y][x];
            g.setColor(c, c, c); // Grayscale
            g.drawPixel(x, y);
          }
        }
        g.flip();
      }
    }
  }
}, { uart: false });