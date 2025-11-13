import asyncio
from bleak import BleakClient, BleakScanner
import time

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fad"

received_bytes = 0
received_packets = 0
start_time = time.time()

def notification_handler(sender, data):
    global received_bytes, received_packets
    # print(f"Received {len(data)} bytes: {list(data)}")
    received_bytes += len(data)
    received_packets += 1

async def main():
    print("Scanning for Bangle.js Max...")
    devices = await BleakScanner.discover()
    bangle = None
    for d in devices:
        if d.name and "Bangle.js Max" in d.name:
            bangle = d
            break
    if not bangle:
        print("Device not found.")
        return

    async with BleakClient(bangle) as client:
        print("Connected. Subscribing to notifications...")
        await client.start_notify(CHAR_UUID, notification_handler)
        global received_bytes, received_packets, start_time
        while True:
            await asyncio.sleep(1)
            elapsed = time.time() - start_time
            throughput = received_bytes / elapsed  # bytes/sec
            throughput_kbps = (throughput * 8) / 1000  # convert bytes/sec to kilobits/sec
            print(f"Throughput: {throughput_kbps:.2f} Kbps, Packets: {received_packets} per sec")
            received_bytes = 0
            received_packets = 0
            start_time = time.time()

if __name__ == "__main__":
    asyncio.run(main())