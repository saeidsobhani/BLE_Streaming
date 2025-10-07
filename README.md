# Adaptive Optimization of Bluetooth Data Transfer on Wearable Platforms  
*Master's Thesis by Saeid Sobhani*  
Supervised by: **[Prof. Dr. Kristof Van Laerhoven](https://ubi29.informatik.uni-siegen.de/usi/team_kvl.html)**  
University of Siegen – Chair for Ubiquitous Computingaptive 

---

## 🎯 Project Overview  
This project investigates how to **optimize Bluetooth Low Energy (BLE) data transmission** between a smartwatch and a host computer using **adaptive compression and quantization methods**.  

The research focuses on the **[Bangle.js 1](https://www.espruino.com/Bangle.js)** smartwatch platform, equipped with motion and magnetic sensors. The goal is to improve BLE throughput efficiency for streaming sensor data (accelerometer, magnetometer) and visual data (bitmap sequences).

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

## 📊 Expected Outcomes  
- A working prototype that adaptively optimizes BLE data transmission for wearables.  
- Quantitative performance improvements (throughput, latency).  
- Insights into the trade-offs between data fidelity, sampling rate, and BLE bandwidth.  

---


