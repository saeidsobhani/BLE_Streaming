import asyncio
import time
import struct
from bleak import BleakClient, BleakScanner

SERVICE_UUID = "f26d62fe-3686-4241-ab06-0dad88068fac"
BUNDLED_CHAR_UUID = "f26d62fe-3686-4241-ab06-0dad88068fae"

ACC_SCALE = 1000        # mg on device -> divide by 1000 to get g

async def main():
    notify_count = 0    # Number of notifications received
    sample_count = 0    # Total number of samples received

    def on_combined(sender, data: bytearray):
        nonlocal notify_count, sample_count

        # Each sample is 6 bytes (3 × int16)
        data_len = len(data)
        num_samples = data_len // 6  # Calculate how many samples in this notification
        
        if data_len % 6 != 0:
            print(f"Warning: Invalid data length {data_len}, expected multiple of 6 bytes")
            return
        
        # Unpack all samples in this notification
        for i in range(num_samples):
            offset = i * 6  # Each sample is 6 bytes
            sample_data = data[offset:offset+6]
            
            # Unpack: [ax, ay, az] as int16 LE
            ax_mg, ay_mg, az_mg = struct.unpack("<hhh", sample_data)
            
            # Convert to physical units
            accel_g = (ax_mg / ACC_SCALE, ay_mg / ACC_SCALE, az_mg / ACC_SCALE)            
            # Uncomment to see individual samples
            # print(f"Sample {i+1}/{num_samples}: Accel(g): {accel_g}")
        
        notify_count += 1
        sample_count += num_samples

    async def print_rates():
        last_t = time.monotonic()
        last_notify = 0
        last_sample = 0
        while True:
            await asyncio.sleep(5.0)
            now = time.monotonic()
            dt = max(now - last_t, 1e-6)
            
            notify_hz = (notify_count - last_notify) / dt
            sample_hz = (sample_count - last_sample) / dt
            samples_per_notify = (sample_count - last_sample) / max(notify_count - last_notify, 1)
            
            print(f"Notification rate: {notify_hz:.1f} Hz")
            print(f"Sample rate: {sample_hz:.1f} Hz")
            print(f"Samples per notification: {samples_per_notify:.1f}")
            print(f"Total: {notify_count} notifications, {sample_count} samples")
            print()
            
            last_t = now
            last_notify = notify_count
            last_sample = sample_count

    print("Scanning for BLE devices...")
    devices = await BleakScanner.discover()
    target = next((d for d in devices if d.name == "Bangle.js Sensor"), None)
    if not target:
        print("Bangle.js Sensor device not found. Make sure it's broadcasting.")
        return
    
    print("Connecting to Bangle.js Sensor")
    async with BleakClient(target) as client:
        print("Connected!")

        # Default MTU = 23 bytes (20 usable)
        # Negotiated MTU = 53 bytes (50 usable)
        USE_MTU_NEGOTIATION = False  # Set to False to use default MTU = 23
        backend = client._backend
        
        if USE_MTU_NEGOTIATION:
            # Negotiate higher MTU with peripheral
            print("Requesting MTU exchange...")
            try:
                await backend._acquire_mtu()
                print("MTU negotiation completed successfully")
            except Exception as e:
                print(f"MTU negotiation failed: {e}")
        else:
            # Skip negotiation - use default MTU
            print("Skipping MTU negotiation (using BLE default)")
        

        mtu = backend.mtu_size
        print(f"Backend reported MTU size: {mtu} bytes")

        # Report MTU information
        max_samples_per_notify = (mtu - 3) // 6
        print(f"Usable payload: {mtu - 3} bytes")
        print(f"Can fit {max_samples_per_notify} sample(s) per notification")

        services = getattr(client, "services", None)
        if services:
            for service in services:
                if service.uuid.lower() == SERVICE_UUID.lower():
                    print(f"Service: {service.uuid}")
                    for char in service.characteristics:
                        print(f"  Char: {char.uuid}, properties: {char.properties}")

        # Test: Try reading the characteristic value directly
        print("\nTesting: Reading characteristic value...")
        try:
            test_value = await client.read_gatt_char(BUNDLED_CHAR_UUID)
            print(f"✓ Successfully read {len(test_value)} bytes from characteristic")
            print(f"  Value: {test_value.hex()}")
        except Exception as e:
            print(f"⚠ Could not read characteristic: {e}")

        try:
            print(f"Attempting to subscribe to characteristic: {BUNDLED_CHAR_UUID}")
            await client.start_notify(BUNDLED_CHAR_UUID, on_combined)
            print("✓ Successfully subscribed to bundled notifications.")
            print("✓ Callback function registered: on_combined")
            print("✓ Waiting for notifications from Bangle.js...")
        except Exception as e:
            print(f"❌ Failed to subscribe to bundled characteristic: {e}")
            import traceback
            traceback.print_exc()
            return

        print("\nListening for data... Press Ctrl+C to stop.")
        rate_task = asyncio.create_task(print_rates())
        try:
            await asyncio.sleep(float('inf'))
        except KeyboardInterrupt:
            print("\nStopping...")
        finally:
            rate_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())