import cv2 as cv
import numpy as np
from PIL import Image
from bleak import BleakClient

WATCH_BLE_ADDRESS = "CE:5E:7B:29:74:E4"  # Replace with your watch's BLE address
CHAR_UUID = "your-characteristic-uuid"    # Replace with your BLE characteristic UUID

def to_nbit_grayscale(img, bits):
    img = np.array(img.convert("L"))  # Convert to grayscale
    levels = 2 ** bits
    img = (img / 256 * levels).astype(np.uint8)
    img = (img * (255 // (levels - 1))).astype(np.uint8)
    return Image.fromarray(img)

def pad_or_resize(img, size=(240, 240)):
    img = img.resize(size, Image.BILINEAR)
    return img

def frame_to_bytes(img, bits):
    arr = np.array(img)
    if bits == 2:
        packed = np.packbits((arr // 85).astype(np.uint8), bitorder='big')
    elif bits == 4:
        packed = ((arr // 17) & 0x0F).astype(np.uint8)
        packed = packed.flatten().tobytes()
    else:
        packed = arr.flatten().tobytes()
    return packed

async def send_video(video_path, bits=2):
    cap = cv.VideoCapture(video_path)
    async with BleakClient(WATCH_BLE_ADDRESS) as client:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            img = Image.fromarray(cv.cvtColor(frame, cv.COLOR_BGR2RGB))
            img = pad_or_resize(img)
            img = to_nbit_grayscale(img, bits)
            data = frame_to_bytes(img, bits)
            await client.write_gatt_char(CHAR_UUID, data)
    cap.release()

# Usage example:
# import asyncio
# asyncio.run(send_video("your_video.mp4", bits=2))