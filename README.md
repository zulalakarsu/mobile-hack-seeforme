# SeeForMe - On Device AI Vision 

![SeeForMe](https://img.shields.io/badge/SeeForMe-AI%20Vision%20Assistant-blue) ![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-green) ![React Native](https://img.shields.io/badge/React%20Native-0.81-blue) ![Expo](https://img.shields.io/badge/Expo-54-lightblue) ![AI](https://img.shields.io/badge/AI-LFM2--VL--450M-purple)

**SeeForMe** is an AI-powered visual assistant for the visually impaired that runs entirely on your device — no internet required, no data ever leaves your phone. Simply point your camera at anything. SeeForMe instantly describes what it sees in natural, spoken language — helping you navigate the world with confidence and independence.

## Problem 

**285 million people worldwide** are visually impaired, facing daily challenges in:

- **Understanding surroundings** - Identifying objects, reading text, recognizing people
- **Navigation barriers** - Moving through unfamiliar environments safely  
- **Technology limitations** - Complex interfaces, internet dependency, expensive hardware
- **Independence challenges** - Relying on others for visual information

## Demo

<img width="300" height="600" alt="Image" src="https://github.com/user-attachments/assets/4277525a-ecc7-4569-84f5-02d2b914c0e0" />

### **Simple 3-Step Process**
1. **Point** - Aim camera at any object or scene
2. **Scan** - Tap the large, prominent scan button  
3. **Listen** - Hear detailed description through device speakers

## Technology Stack

### **AI & Machine Learning**
- **Cactus React Native SDK** for on-device AI inference
- **LiquidAI LFM2-VL-450M** vision-language model
- **React Native Nitro Modules** for high-performance execution
- **Quantized Models** optimized for mobile devices

### **Device Integration**
- **expo-camera** for camera functionality and real-time feed
- **expo-speech** for natural text-to-speech synthesis
- **AsyncStorage** for offline model and preference storage
- **Native Performance** with 60fps camera preview

### **Frontend & UI**
- **React Native** 0.81 with Expo SDK 54
- **TypeScript** for type-safe development  
- **Modern iOS Design Language** with glassmorphism effects
- **Accessibility APIs** for screen reader integration

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- iOS 13+ / Android 8+ device or simulator
- 2GB+ free storage for AI model

### **Installation**

```bash
# Clone repository
git clone https://github.com/zulalakarsu/seeforme.git
cd seeformen-app

# Install dependencies
npm install

# Start development server
npx expo start
```

---

<div align="center">

**SeeForMe** 

*Built with ❤️ for accessibility and inclusion*

</div>
