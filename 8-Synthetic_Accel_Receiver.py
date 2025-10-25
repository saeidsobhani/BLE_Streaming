import asyncio
from bleak import BleakClient, BleakScanner
import struct
import time

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fad"
DEVICE_NAME = "Bangle.js Accel"

received_count = 0
start_time = None


def handle_notification(sender, data):
    global received_count, start_time
    # Unpack 3 int16 values (x, y, z)
    x, y, z = struct.unpack("<hhh", data)
    received_count += 1
    if received_count == 1:
        start_time = time.time()
    #print(f"x={x}, y={y}, z={z}")
    # Print data rate every 250 samples
    if received_count % 250 == 0:
        elapsed = time.time() - start_time
        rate = received_count / elapsed if elapsed > 0 else 0
        print(f"Data rate: {rate:.2f} Hz")

async def main():
    print("Scanning for device...")
    devices = await BleakScanner.discover()
    target = None
    for d in devices:
        if d.name == DEVICE_NAME:
            target = d
            break
    if not target:
        print("Device not found.")
        return
    print(f"Connecting to {target.address}...")
    async with BleakClient(target.address) as client:
        print("Connected.")
        await client.start_notify(CHAR_UUID, handle_notification)
        print("Receiving notifications...")
        # Run indefinitely
        while True:
            await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())
