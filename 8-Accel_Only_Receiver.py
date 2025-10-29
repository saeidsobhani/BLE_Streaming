import asyncio
from bleak import BleakClient, BleakScanner
import struct
import time

# UUIDs from your GATT server
SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
ACCEL_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fad"
accel_count = 0


def handle_accel(sender, data):
    global accel_count
    # Each notification contains 16 samples (48 bytes)
    samples = struct.unpack('<' + 'bbb'*16, data)
    accel_count += 16
    # Print all 16 samples from this notification
    # for i in range(16):
    #     x, y, z = samples[i*3 : i*3+3]
    #     x_g = x * 0.03125
    #     y_g = y * 0.03125
    #     z_g = z * 0.03125
    #     print(f"Accelerometer: x={x_g:.4f}g, y={y_g:.4f}g, z={z_g:.4f}g")



async def main():
    print("Scanning for Bangle.js Accel Sensor...")
    devices = await BleakScanner.discover()
    bangle = None
    for d in devices:
        if d.name == "Bangle.js Sensor":
            bangle = d
            break
    if not bangle:
        print("Bangle.js Sensor not found!")
        return

    async with BleakClient(bangle) as client:
        print("Connected!")
        await client.start_notify(ACCEL_CHAR_UUID, handle_accel)
        print("Receiving notifications... (Press Ctrl+C to stop)")

        async def print_rates():
            last = time.monotonic()
            last_acc = 0
            while True:
                await asyncio.sleep(5.0)
                now = time.monotonic()
                dt = max(now - last, 1e-6)
                acc_hz = (accel_count - last_acc) / dt
                print(f"Rates: Accel ~ {acc_hz:.1f} Hz")
                last = now
                last_acc = accel_count

        await print_rates()

if __name__ == "__main__":
    asyncio.run(main())
