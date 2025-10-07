# Adaptive Optimization of Bluetooth Data Transfer on Wearable Platforms  
*Master’s Thesis by Saeid Sobhani*  
Supervised by: **Prof. Dr. Kristof Van Laerhoven**  
University of Siegen – Chair for Ubiquitous Computing  

---

## 🎯 Project Overview  
This project investigates how to **optimize Bluetooth Low Energy (BLE) data transmission** between a smartwatch and a host computer using **adaptive compression and quantization methods**.  

The research focuses on the **Bangle.js 1** smartwatch platform, equipped with motion and magnetic sensors. The goal is to improve BLE throughput efficiency for streaming sensor data (accelerometer, magnetometer) and visual data (bitmap sequences) while maintaining energy efficiency and low latency.  

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
  - 3-axis Magnetometer  
  - 240×240 16-bit LCD Display  
- **Host Computer**
  - BLE Dongle (e.g., nRF52840) or integrated Bluetooth adapter  

### **Software**
- [Espruino IDE](https://www.espruino.com/ide/) for watch-side programming  
- Python 3 (with [`bleak`](https://github.com/hbldh/bleak) library) for PC-side communication  
- WebBLE (JavaScript API) for browser-based real-time visualization  
- Optional: Nordic SDK for BLE profiling  

---

## ⚙️ Implementation Progress  

### ✅ Current Status
- Established BLE connection between **Bangle.js 1** and PC.  
- Implemented streaming and sampling rate monitoring for accelerometer and magnetometer.  
- Successfully increased magnetometer sampling rate using `Bangle.compassWr()`.  
- Investigating accelerometer register configuration via I2C (KX023).  

### 🚧 Next Steps
- Achieve higher accelerometer sampling rates via I2C or firmware-level modification.  
- Implement adaptive quantization and compression methods for sensor data.  
- Develop WebBLE demonstrator for real-time data rate visualization.  
- Conduct throughput and latency measurements for comparison.  

---

## 🧪 Experimental Plan
1. **Baseline Measurements:** Measure raw BLE throughput, latency, and packet loss.  
2. **Adaptive Algorithm Design:** Implement data quantization and adaptive sampling rate control.  
3. **Evaluation:** Compare adaptive vs. fixed transmission strategies.  
4. **Visualization:** Use WebBLE to display real-time streaming results in a browser.  

---

## 📊 Expected Outcomes  
- A working prototype that adaptively optimizes BLE data transmission for wearables.  
- Quantitative performance improvements (throughput, latency).  
- Insights into the trade-offs between data fidelity, sampling rate, and BLE bandwidth.  

---


