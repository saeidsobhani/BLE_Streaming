import asyncio
from bleak import BleakClient, BleakScanner
import struct
import time

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
ACCEL_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fad"
MAG_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fae"
HRM_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fbf"
hrm_count = 0

def handle_hrm(sender, data):
    global hrm_count
    # Each notification contains one sample (1 byte, signed)
    hrm_raw, = struct.unpack('<b', data)
    hrm_count += 1
    #print(f"HRM raw: {hrm_raw}")

accel_count = 0
mag_count = 0


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


def handle_mag(sender, data):
    global mag_count
    # Each notification contains one sample (6 bytes)
    x_dec, y_dec, z_dec = struct.unpack('<hhh', data)
    mag_count += 1
    # x_uT = x_dec * 0.6
    # y_uT = y_dec * 0.6
    # z_uT = z_dec * 0.6
    # print(f"Mag: x={x_uT:.3f}uT, y={y_uT:.3f}uT, z={z_uT:.3f}uT")

async def main():
    print("Scanning for Bangle.js Sensor...")
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
        await client.start_notify(MAG_CHAR_UUID, handle_mag)
        await client.start_notify(HRM_CHAR_UUID, handle_hrm)
        print("Receiving notifications... (Press Ctrl+C to stop)")

        async def print_rates():
            last = time.monotonic()
            last_acc = last_mag = last_hrm = 0
            while True:
                await asyncio.sleep(5.0)
                now = time.monotonic()
                dt = max(now - last, 1e-6)
                acc_hz = (accel_count - last_acc) / dt
                mag_hz = (mag_count - last_mag) / dt
                hrm_hz = (hrm_count - last_hrm) / dt
                print(f"Rates: Accel ~ {acc_hz:.1f} Hz, Mag ~ {mag_hz:.1f} Hz, HRM ~ {hrm_hz:.1f} Hz")
                last = now
                last_acc = accel_count
                last_mag = mag_count
                last_hrm = hrm_count

        await print_rates()

if __name__ == "__main__":
    asyncio.run(main())
