import asyncio  # For asynchrony
import bleak    #BLE library for Python
from bleak import BleakClient, BleakScanner
import struct  # For unpacking binary data

# UUIDs from the JavaScript code
SERVICE_UUID = "f8b23a4d-89ad-4220-8c9f-d81756009f0c"
MAGNETOMETER_CHAR_UUID = "f8b23a4d-89ad-4220-8c9f-d81756009f0e"
ACCELEROMETER_CHAR_UUID = "f8b23a4d-89ad-4220-8c9f-d81756009f0d"

def mag_notification_handler(sender, data):
    print("Mag notification received, raw data:", data)  # Debug: Check if notifications arrive
    # Data is Int32Array (3 values)
    values = struct.unpack('<iii', data)
    print(f"Magnetometer: X={values[0]}, Y={values[1]}, Z={values[2]}")

def accel_notification_handler(sender, data):
    print("Accel notification received, raw data:", data)  # Debug: Check if notifications arrive
    # Data is Float32Array (3 values)
    values = struct.unpack('<fff', data)
    print(f"Accelerometer: X={values[0]:.2f}, Y={values[1]:.2f}, Z={values[2]:.2f}")

async def main():
    print("Scanning for BLE devices...")
    devices = await BleakScanner.discover() #scan for devices
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

        # Debug: Discover services and characteristics
        services = client.services
        for service in services:
            print(f"Service: {service.uuid}")
            for char in service.characteristics:
                print(f"  Char: {char.uuid}, properties: {char.properties}")

        # Subscribe to magnetometer notifications
        try:
            await client.start_notify(MAGNETOMETER_CHAR_UUID, mag_notification_handler)
            print("Subscribed to magnetometer notifications.")
        except Exception as e:
            print(f"Failed to subscribe to magnetometer: {e}")

        # Subscribe to accelerometer notifications
        try:
            await client.start_notify(ACCELEROMETER_CHAR_UUID, accel_notification_handler)
            print("Subscribed to accelerometer notifications.")
        except Exception as e:
            print(f"Failed to subscribe to accelerometer: {e}")

        print("Subscribed to notifications. Press Ctrl+C to stop.")
        try:
            await asyncio.sleep(float('inf'))  # Run indefinitely until interrupted
        except KeyboardInterrupt:
            print("Stopping...")

if __name__ == "__main__":
    asyncio.run(main())