import asyncio  # For asynchrony
import time     # For rate timing
from bleak import BleakClient, BleakScanner
import struct  # For unpacking binary data

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
MAGNETOMETER_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fae"

async def main():
    # Counters for data rate
    mag_count = 0

    def on_mag(sender, data):
        x_raw, y_raw, z_raw = struct.unpack('<hhh', data)
        #x_uT, y_uT, z_uT = x_raw * 0.6, y_raw * 0.6, z_raw * 0.6 # Convert to µT
        #print(f"Mag (µT): X={x_uT:.1f}, Y={y_uT:.1f}, Z={z_uT:.1f}")
        nonlocal mag_count # Use nonlocal to modify outer scope variable
        mag_count += 1

    async def print_rates():
        last = time.monotonic() # Current time in seconds
        last_mag = 0 # Last counts for rate calculation
        while True:
            await asyncio.sleep(5.0) # Print every 5 seconds
            now = time.monotonic()
            dt = max(now - last, 1e-6)
            # Compute Hz over the last interval
            mag_hz = (mag_count - last_mag) / dt
            print(f"Mag ~ {mag_hz:.1f} Hz")
            last = now
            last_mag = mag_count

    print("Scanning for BLE devices...")
    devices = await BleakScanner.discover()  # scan for devices
    target_device = None #initialize target_device
    for device in devices:
        if device.name == "Bangle.js Sensor":
            target_device = device
            break

    if not target_device:
        print("Bangle.js Sensor device not found. Make sure it's broadcasting.")
        return

    print(f"Connecting to Bangle.js Sensor")
    async with BleakClient(target_device) as client:
        print("Connected!")
        services = getattr(client, "services", None)
        if services:
            for service in services:
                if service.uuid.lower() == SERVICE_UUID.lower():
                    print(f"Service: {service.uuid}")
                    for char in service.characteristics:
                        print(f"  Char: {char.uuid}, properties: {char.properties}")

        # Subscribe to magnetometer notifications
        try:
            await client.start_notify(MAGNETOMETER_CHAR_UUID, on_mag)
            print("Subscribed to magnetometer notifications.")
        except Exception as e:
            print(f"Failed to subscribe to magnetometer: {e}")


        print("Subscribed to notification. Press Ctrl+C to stop.")
        rate_task = asyncio.create_task(print_rates())
        try:
            await asyncio.sleep(float('inf'))  # Run indefinitely until interrupted
        except KeyboardInterrupt:
            print("Stopping...")
        finally:
            rate_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())