import asyncio
import time
import struct
from bleak import BleakClient, BleakScanner

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
COMBINED_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fab"

ACC_SCALE = 1000        # mg on device -> divide by 1000 to get g
MAG_LSB_TO_uT = 0.6     # raw LSB -> µT

async def main():
    notify_count = 0    # Number of notifications received

    def on_combined(sender, data: bytearray):
        nonlocal notify_count
        
        # Unpack: [ax, ay, az, mx, my, mz] as int16 LE
        ax_mg, ay_mg, az_mg, mx_raw, my_raw, mz_raw = struct.unpack("<hhhhhh", data)
        
        # Convert to physical units and see individual samples
        #accel_g = (ax_mg / ACC_SCALE, ay_mg / ACC_SCALE, az_mg / ACC_SCALE)
        #mag_uT  = (mx_raw * MAG_LSB_TO_uT, my_raw * MAG_LSB_TO_uT, mz_raw * MAG_LSB_TO_uT)
        #print(f"Accel(g): {accel_g}, Mag(µT): {mag_uT}")
        
        notify_count += 1

    async def print_rates():
        last_t = time.monotonic()
        last_notify = 0
        while True:
            await asyncio.sleep(5.0)
            now = time.monotonic()
            dt = max(now - last_t, 1e-6)
            
            notify_hz = (notify_count - last_notify) / dt
            
            print(f"Notification rate: {notify_hz:.1f} Hz")
            print(f"Total: {notify_count} notifications")
            print()
            
            last_t = now
            last_notify = notify_count

    print("Scanning for BLE devices...")
    devices = await BleakScanner.discover()
    target = next((d for d in devices if d.name == "Bangle.js Sensor"), None)
    if not target:
        print("Bangle.js Sensor device not found. Make sure it's broadcasting.")
        return
    
    print("Connecting to Bangle.js Sensor")
    async with BleakClient(target) as client:
        print("Connected!")

        # Subscribe to characteristic notifications
        try:
            await client.start_notify(COMBINED_CHAR_UUID, on_combined)
            print("Subscribed to notifications. Press Ctrl+C to stop.")
        except Exception as e:
            print(f"Failed to subscribe: {e}")
            return
        rate_task = asyncio.create_task(print_rates())
        try:
            await asyncio.sleep(float('inf'))
        except KeyboardInterrupt:
            print("\nStopping...")
        finally:
            rate_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())
