# Adaptive Optimization of Bluetooth Data Transfer on Wearable Platforms  
Master's Thesis by [Saeid Sobhani](http://www.linkedin.com/in/saeid-sobhani)  
Supervised by: **[Prof. Dr. Kristof Van Laerhoven](https://ubi29.informatik.uni-siegen.de/usi/team_kvl.html)**  
University of Siegen – Chair for Ubiquitous Computing 

---

## � Live Web Dashboards

**👉 [Access Interactive Dashboards](https://saeidsobhani.github.io/BLE_Streaming/)**

Experience real-time sensor data streaming directly in your browser! The project includes WebBLE-enabled dashboards for:
- 📊 **Accelerometer Streaming** - High-frequency 3-axis motion data
- 🧲 **Magnetometer Streaming** - Magnetic field visualization
- 💓 **Heart Rate Monitoring** - Dual-rate HRM data
- 🔄 **Multi-Sensor Fusion** - Combined sensor streaming

> **Note:** Web Bluetooth requires a compatible browser (Chrome, Edge, or Opera) and HTTPS connection.

---

## �🎯 Project Overview  
This project investigates how to **optimize Bluetooth Low Energy (BLE) data transmission** between a smartwatch and a host computer using **adaptive compression and quantization methods**.  

The research focuses on the **[Bangle.js 1](https://www.espruino.com/Bangle.js)** smartwatch platform, equipped with motion and magnetic sensors. The goal is to improve BLE throughput efficiency for streaming sensor data (accelerometer, magnetometer) and visual data (bitmap sequences).

---

## 🚀 Quick Start Guide

### **Option 1: Web Dashboards (Easiest)**
1. Visit the [Live Dashboard](https://saeidsobhani.github.io/BLE_Streaming/)
2. Open the [Espruino Web IDE](https://www.espruino.com/ide/) in another tab
3. Upload the corresponding `.js` file to your Bangle.js
4. Return to the dashboard and click "Connect to Bangle.js"
5. Watch real-time data streaming!

### **Option 2: Python Receivers (For Data Analysis)**
1. Clone this repository:
   ```bash
   git clone https://github.com/saeidsobhani/BLE_Streaming.git
   cd BLE_Streaming
   ```
2. Install dependencies:
   ```bash
   pip install bleak numpy
   ```
3. Upload a GATT server script to Bangle.js using [Espruino IDE](https://www.espruino.com/ide/)
4. Run the corresponding Python receiver:
   ```bash
   python 1_Accelerometer/2_Single_Sample_Direct_Streaming_Receiver.py
   ```

---

## 🧠 Research Goals  
- Analyze BLE communication limitations on embedded wearable devices.  
- Design adaptive algorithms to optimize data transmission based on BLE bandwidth and context.  
- Evaluate BLE throughput and latency when sending:  
  1. Sensor data (accelerometer + magnetometer).  
  2. Bitmap sequences to the watch display.  
- Develop a **WebBLE-based real-time demonstrator** to visualize performance improvements.  

---

## 🧩 Hardware and Software Setup  

### **Hardware**
- **Bangle.js 1 Smartwatch**
  - nRF52832 ARM Cortex-M4 @ 64 MHz  
  - 64 KB RAM / 512 KB Flash + 4 MB external Flash  
  - 3-axis Accelerometer (KX023)
  - 3-axis Magnetometer  (GMC303)
  - 240×240 16-bit LCD Display  
- **Host Computer**
  - BLE Dongle or integrated Bluetooth adapter  

### **Software**
- [Espruino IDE](https://www.espruino.com/ide/) for watch-side programming  
- Python 3 for PC-side communication  
- WebBLE (JavaScript API) for browser-based real-time visualization  

---

## 📁 Project Structure

```
BLE_Streaming/
├── index.html                          # Main web dashboard landing page
├── 1_Accelerometer/                    # Accelerometer optimization experiments
│   ├── 1_Single_Sample_Direct_Streaming_GATT_Server.js
│   ├── 2_Single_Sample_Direct_Streaming_Receiver.py
│   ├── 3_Eight_Samples_Bundling_GATT_Server.js
│   ├── 4_Eight_Samples_Bundling_Receiver.py
│   ├── 5_FIFO_Based_Streaming_with_Interruption_GATT_Server.js
│   ├── 6_Buffer_Streaming_Without_Interruption_GATT_Server.js
│   ├── 7_FIFO_&_Buffer_Streaming_Receiver.py
│   └── 8_Accelerometer_WebBLE_Dashboard_LineGraph.html
├── 2_Magnetometer/                     # Magnetometer streaming
│   ├── 1_Magnetometer_GATT_Server.js
│   ├── 2_Magnetometer_Receiver.py
│   └── 3_Magnetometer_WebBLE_Dashboard.html
├── 3_HRM/                              # Heart Rate Monitor experiments
│   ├── 1_HRM_2Methods_Sender.js
│   ├── 2_HRM_2Methods_Receiver.html
│   ├── 3_HRM_Analog_Sender.js
│   └── 4_HRM_Analog_Receiver.py
├── 4_Accelerometer_and_Magnetometer/   # Multi-sensor fusion
│   ├── 0-WebBLE_Dashboard_LineGraph.html
│   ├── 1-Two_Characteristics_GATT_Server.js
│   ├── 2-Two_Characteristics_Receiver.py
│   ├── 3-One_Characteristic_GATT_Server_Unbundled.js
│   ├── 4-One_Characteristic_Receiver_Unbundled.py
│   ├── 5-One_Characteristic_GATT_Server_4Sample_Bundled.js
│   └── 6-One_Characteristic_Receiver_4Sample_Bundled.py
└── 5_Synthetic/                        # Synthetic data for testing
    ├── 1-Random_Accel_GATT_Server.js
    ├── 2-Const_Accel_GATT_Server.js
    ├── 3-Synthetic_Accel_Receiver.py
    ├── 4-Const_50_Bytes_GATT_Server.js
    └── 5-Const_50_Bytes_Receiver.py
```

---

## 🔬 Experiment Categories

### **1. Accelerometer Experiments**
Progressive optimization of accelerometer data streaming:
- **Single sample direct streaming** - Baseline approach
- **8-sample bundling** - Reduces BLE overhead by grouping samples
- **FIFO-based streaming** - Hardware buffer with interruption
- **Buffer streaming** - Optimized buffering without interruption

### **2. Magnetometer Experiments**
Standalone 3-axis magnetometer streaming at 100 Hz

### **3. Heart Rate Monitor (HRM)**
Dual-rate streaming testing:
- Analog raw data at 200 Hz
- Processed HRM data at 50 Hz

### **4. Multi-Sensor Fusion**
Different strategies for streaming multiple sensors:
- **Two characteristics** - Separate BLE characteristics per sensor
- **One characteristic unbundled** - Combined but sent separately
- **One characteristic bundled** - 4 samples bundled for efficiency

### **5. Synthetic Data Tests**
Controlled testing with synthetic data for throughput benchmarking

---

## 🌐 Deploying to GitHub Pages

The web dashboards are automatically hosted via GitHub Pages. To enable:

1. Go to your repository **Settings** → **Pages**
2. Under **Source**, select `main` branch and `/ (root)` folder
3. Click **Save**
4. Your dashboards will be available at: `https://saeidsobhani.github.io/BLE_Streaming/`

The `index.html` in the root directory serves as the main landing page with links to all experiments.

---

## 📊 Expected Outcomes  
- A working prototype that adaptively optimizes BLE data transmission for wearables.  
- Quantitative performance improvements (throughput, latency).  
- Insights into the trade-offs between data fidelity, sampling rate, and BLE bandwidth.  

---


