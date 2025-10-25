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
    samples = struct.unpack('<24h', data)
    for i in range(8):
        x, y, z = samples[i*3], samples[i*3+1], samples[i*3+2]
        received_count += 1
        #print(f"Sample {received_count}: x={x}, y={y}, z={z}")
        if received_count == 1:
            start_time = time.time()
        if received_count % 500 == 0:
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
        mtu = client._backend.mtu_size
        print(f"Current MTU size: {mtu} bytes")
            # MTU negotiation (commented out, using default MTU)
            # async def negotiate_mtu(client):
            #     backend = client._backend
            #     print("Requesting MTU exchange...")
            #     try:
            #         await backend._acquire_mtu()
            #         print("MTU negotiation completed successfully")
            #     except Exception as e:
            #         print(f"MTU negotiation failed: {e}")
            #     mtu = backend.mtu_size
            #     print(f"Backend reported MTU size: {mtu} bytes")
            # await negotiate_mtu(client)
        await client.start_notify(CHAR_UUID, handle_notification)
        print("Receiving notifications...")
        while True:
            await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())
