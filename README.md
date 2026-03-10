# BLE Data Streaming Performance on Wearable Platforms  
**Master's Thesis (Completed)** by [Saeid Sobhani](http://www.linkedin.com/in/saeid-sobhani)  
Supervised by: **[Prof. Dr. Kristof Van Laerhoven](https://ubi29.informatik.uni-siegen.de/usi/team_kvl.html)**  
University of Siegen – Chair for Ubiquitous Computing | 2025-2026 

---

## � Live Web Dashboards

**👉 [Access Interactive Dashboards](https://saeidsobhani.github.io/BLE_Streaming/)**

Experience real-time sensor data streaming directly in your browser! The project includes WebBLE-enabled dashboards for:
- 📊 **Accelerometer Streaming** - Up to 1000 Hz high-frequency 3-axis motion data
- 🧲 **Magnetometer Streaming** - 92 Hz magnetic field visualization
- 💓 **Heart Rate Monitoring** - 252 Hz dual-rate HRM data
- 🔄 **Multi-Sensor Fusion** - Combined sensor streaming

> **Note:** Web Bluetooth requires a compatible browser (Chrome, Edge, or Opera) and HTTPS connection.

---

## 📋 Project Overview  
This thesis investigates the **practical limitations of Bluetooth Low Energy (BLE) data streaming** on wearable devices and develops optimization strategies to maximize sensor streaming throughput. Through systematic empirical evaluation on the **[Bangle.js 1](https://www.espruino.com/Bangle.js)** smartwatch, the research identifies performance bottlenecks and achieves up to **10× throughput improvement** over baseline implementations.

**Key Finding:** JavaScript interpreter overhead is the primary bottleneck—not BLE protocol limitations. Direct hardware buffer access achieves 1000 Hz streaming, while event-driven approaches reach only 93 Hz.

---

## 🚀 Quick Start Guide

### **Option 1: Web Dashboards (Easiest)**
1. Visit the [Live Dashboard](https://saeidsobhani.github.io/BLE_Streaming/)
2. Choose one of the options and click "Connect to Bangle.js"
3. Watch real-time data streaming!


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
3. Upload a GATT server script ( `.js` files ) to Bangle.js using [Espruino IDE](https://www.espruino.com/ide/)
4. Run the corresponding Python receiver:
   ```bash
   python 1_Accelerometer/2_Single_Sample_Direct_Streaming_Receiver.py
   ```

---

## 🔬 Key Research Findings  

### Achieved Data Rates
| Sensor Type | Method | Rate (Hz) |
|-------------|--------|----------|
| Accelerometer | Single-sample baseline | 93.1 |
| Accelerometer | 8-sample bundling | 83.8 |
| Accelerometer | FIFO interrupt | 895.9 |
| Accelerometer | Buffer streaming | **1000** |
| Magnetometer | Direct streaming | 92 |
| Heart Rate Monitor | Dual-rate | 252 |

### Primary Bottleneck Identified
**JavaScript interpreter overhead** is the dominant performance constraint, not BLE protocol limitations. The tenfold improvement (93 Hz → 1000 Hz) was achieved through firmware-level optimization that bypasses high-level language abstractions.  

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

### **1. Accelerometer** - Four Progressive Optimization Methods
- **Single-sample streaming** (93.1 Hz) - Baseline
- **8-sample bundling** (83.8 Hz) - Demonstrates firmware overhead issue
- **FIFO interrupt** (895.9 Hz) - Hardware buffer polling
- **Buffer streaming** (1000 Hz) - Direct hardware access ✓ Best

### **2. Magnetometer** - Hardware-limited Streaming
- Direct streaming achieving 92 Hz (sensor maximum: 100 Hz)

### **3. Heart Rate Monitor** - Dual-rate Testing
- Raw analog and processed HRM data at 252 Hz combined rate

### **4. Multi-Sensor Fusion** - Combined Streaming Strategies
- Two characteristics vs. one characteristic (bundled/unbundled)
- Trade-offs between separate streams and combined payloads

### **5. Synthetic Data** - Controlled Benchmarking
- Throughput testing with synthetic data patterns

---
## 🎯 Key Contributions

1. **Empirical BLE performance characterization** on smartwatch hardware
2. **Identification of JavaScript overhead** as primary bottleneck (not BLE protocol)
3. **10× throughput improvement** through hardware-firmware co-design
4. **Open-source implementations** for four accelerometer streaming methods
5. **WebBLE dashboards** for platform-independent real-time visualization
6. **Performance baselines** for wearable sensing applications




