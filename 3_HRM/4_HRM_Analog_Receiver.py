import asyncio
from bleak import BleakClient, BleakScanner
import time
import struct

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
ANALOG_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fbd"

async def main():
    analog_count = 0

    def on_analog(sender, data):
        nonlocal analog_count
        analog_raw = int.from_bytes(data, byteorder='little', signed=True)
        # print(f"Received Analog: {analog_raw}")
        analog_count += 1

    async def print_rates():
        last = time.monotonic()
        last_count = 0
        while True:
            await asyncio.sleep(5.0)
            now = time.monotonic()
            dt = max(now - last, 1e-6)
            hz = (analog_count - last_count) / dt
            print(f"Rates: Analog ~ {hz:.1f} Hz")
            last = now
            last_count = analog_count

    print("Scanning for Bangle.js Sensor...")
    devices = await BleakScanner.discover()
    bangle = None
    for d in devices:
        if d.name == "Bangle.js Sensor":
            bangle = d
            break
    if not bangle:
        print("Device not found.")
        return

    async with BleakClient(bangle) as client:
        print("Connected!")
        await client.start_notify(ANALOG_CHAR_UUID, on_analog)
        print("Receiving data... Press Ctrl+C to stop.")
        rate_task = asyncio.create_task(print_rates())
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            print("Stopped.")
            rate_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())