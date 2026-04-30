# 🚀 Gesture Engine OS — AI Hand Gesture Controller

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vitejs.dev/)
[![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-0078D4.svg)](https://mediapipe.dev/)

> **Gesture Engine OS** is a premium, real-time AI-powered hand gesture recognition system. It transforms your webcam into a sophisticated controller, enabling touchless interaction through advanced computer vision.

---

## 🧠 Core Philosophy

This project isn't just a demo—it's a vision of the future of human-computer interaction (HCI). By combining **MediaPipe's high-fidelity hand tracking** with a custom **deterministic gesture classification engine**, we've built a system that is both responsive and incredibly intuitive.

The interface follows a **"Skeuomorphic Glass"** aesthetic, blending modern transparency with tactile, physical-feeling controls to create a professional, mission-critical dashboard experience.

---

## ✨ Key Features

- 🎥 **Real-time Neural Tracking**: High-frequency hand landmark detection (up to 60 FPS).
- 🧠 **Deterministic Gesture Engine**: Custom logic for classifying 20+ distinct gestures.
- ⚡ **Zero-Latency Processing**: Optimized frame-by-frame analysis with sub-10ms processing time.
- 📊 **Live Telemetry**: Real-time monitoring of FPS, processing latency, and detection confidence.
- 🎨 **Premium Glassmorphism UI**: A stunning, hardware-accelerated interface built with Tailwind CSS.
- ⚙️ **Modular Configuration**: Toggle specific gestures, adjust sensitivity, and customize model parameters on the fly.
- 🗂 **Activity Logging**: Full history of detected gestures and action triggers.

---

## 🎮 Gesture Library & Actions

| Gesture | Action | Description |
| :--- | :--- | :--- |
| 👍 **Thumbs Up** | Volume Up | Raise thumb, curl other fingers |
| 👎 **Thumbs Down** | Volume Down | Lower thumb, curl other fingers |
| ✋ **Open Palm** | Play / Pause | Spread all 5 fingers open |
| ✊ **Closed Fist** | Screenshot | All fingers curled into a fist |
| ☝️ **Pointing** | Click / Select | Index finger extended upward |
| 👌 **OK Sign** | Open Browser | Thumb and index form a circle |
| ✌️ **Peace / Two** | Scroll Up | Index and middle finger extended |
| 🤟 **Rock Sign** | Play / Pause | Index and pinky extended |
| 🔫 **Finger Gun** | Like / Favorite | Thumb & index extended |
| 🤌 **Pinch Out** | Zoom Out | Thumb and index apart |

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://reactjs.org/) (Functional Components, Hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI/ML**: [@mediapipe/hands](https://google.github.io/mediapipe/solutions/hands.html)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)

---

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-hand-gesture-controller.git
   cd ai-hand-gesture-controller
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the engine**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   ```

---

## 🔒 Privacy & Security

- **Local Processing**: All hand tracking and gesture recognition happens **locally in your browser**.
- **No Data Uploads**: Camera frames are processed frame-by-frame and are never stored or uploaded to any server.
- **Permission Based**: Camera access is requested only when you click "Start" and can be revoked at any time.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/krishx-dev">Krish Solanki</a>
</p>
