import asyncio
from bleak import BleakClient, BleakScanner
import struct
import time

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fad"
DEVICE_NAME = "Bangle.js Accel"

received_packets = 0
start_time = time.time()


def handle_notification(sender, data):
    global received_packets
    # Each packet contains 8 samples (48 bytes = 8 samples × 3 axes × 2 bytes INT16)
    # data is 48 bytes: [x1,y1,z1, x2,y2,z2, ..., x8,y8,z8]
    received_packets += 8  # Count 8 samples per packet
    # To unpack all 8 samples:
    # samples = struct.unpack("<" + "hhh" * 8, data)
    # print(f"Received 8 samples")


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
        global received_packets, start_time
        start_time = time.time()
        # Run indefinitely
        while True:
            await asyncio.sleep(1)
            elapsed = time.time() - start_time
            samples_per_sec = received_packets / elapsed  # Now counts total samples
            print(f"Samples/sec: {samples_per_sec:.2f}")
            # Reset counters
            received_packets = 0
            start_time = time.time()
            
if __name__ == "__main__":
    asyncio.run(main())
