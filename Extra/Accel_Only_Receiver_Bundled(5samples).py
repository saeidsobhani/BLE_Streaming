import asyncio
import time
from bleak import BleakClient, BleakScanner

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
ACCELEROMETER_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fad"
ACC_SCALE = 1000

async def main():


    accel_count = 0

    def on_accel(sender, data):
        nonlocal accel_count
        # Each notification contains N samples (3 axes each, int16)
        num_samples = len(data) // (3 * 2)  # 3 axes × 2 bytes per int16
        accel_count += num_samples

    async def negotiate_mtu(client):
        backend = client._backend
        print("Requesting MTU exchange...")
        try:
            await backend._acquire_mtu()
            print("MTU negotiation completed successfully")
        except Exception as e:
            print(f"MTU negotiation failed: {e}")
        mtu = backend.mtu_size
        print(f"Backend reported MTU size: {mtu} bytes")

    async def print_rates():
        last = time.monotonic()
        last_acc = 0
        while True:
            await asyncio.sleep(5.0)
            now = time.monotonic()
            dt = max(now - last, 1e-6)
            acc_hz = (accel_count - last_acc) / dt
            print(f"Accel rate: {acc_hz:.1f} Hz")
            last = now
            last_acc = accel_count

    print("Scanning for BLE devices...")
    devices = await BleakScanner.discover()
    target_device = None
    for device in devices:
        if device.name == "Bangle.js Accel":
            target_device = device
            break
    if not target_device:
        print("Bangle.js Accel device not found. Make sure it's broadcasting.")
        return
    print(f"Connecting to Bangle.js Accel")
    async with BleakClient(target_device) as client:
        print("Connected!")
        await negotiate_mtu(client)
        try:
            await client.start_notify(ACCELEROMETER_CHAR_UUID, on_accel)
            print("Subscribed to accelerometer notifications.")
        except Exception as e:
            print(f"Failed to subscribe to accelerometer: {e}")
        print("Subscribed to notifications. Press Ctrl+C to stop.")
        rate_task = asyncio.create_task(print_rates())
        try:
            await asyncio.sleep(float('inf'))
        except KeyboardInterrupt:
            print("Stopping...")
        finally:
            rate_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())
