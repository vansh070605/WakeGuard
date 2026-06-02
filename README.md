# 🛡️ WakeGuard Enterprise
**Advanced AI Vision System for Driver Safety & Fatigue Tracking**

WakeGuard is an extremely fast, client-side driver monitoring system built with **React, Vite, and Tailwind CSS**. It leverages **Google MediaPipe's Face Mesh** to track 478 3D facial landmarks in real-time, operating entirely inside the browser at 60 FPS.

There are **zero backend dependencies**, zero server costs, and total data privacy since the video feed never leaves the user's device!

---

## ⚡ Features

- **👁️ Eye Aspect Ratio (EAR) & PERCLOS Tracking:** Instantly detects microsleeps and droopy eyes by calculating the geometric distance between the eyelids.
- **🗣️ Mouth Aspect Ratio (MAR):** Analyzes the distance between the lips to track frequent yawning.
- **🧭 3D Head Pose (Yaw & Pitch):** Computes head rotation metrics to detect when the driver drops their head (Critical) or looks away from the road (Distracted).
- **🔊 Voice Synthesis Engine:** Uses the browser's built-in Web Speech API to shout voice warnings ("Wake up!", "Keep your eyes on the road") when dangerous thresholds are met.
- **📊 Real-Time Telemetry Dashboard:** A beautifully animated, glassmorphism UI displaying live metrics using Recharts.
- **💾 CSV Session Export:** Allows fleet managers or drivers to export the locally-tracked session logs as a `.csv` file.

---

## 🚀 Quick Start (Local Development)

Because WakeGuard runs entirely on the frontend, starting it locally is incredibly simple.

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd WakeGuard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:** Navigate to `http://localhost:5173` and allow camera access!

---

## 🌐 Deployment Instructions

Because the Python backend was removed (as the AI models are run 100% locally in the browser via WebAssembly), WakeGuard is now a **Static Web Application**. 

The easiest and fastest way to deploy this project for free is using **Vercel** or **Netlify**.

### Deploying to Vercel (Recommended)
1. Push your code to a GitHub repository.
2. Create an account on [Vercel.com](https://vercel.com).
3. Click **Add New -> Project** and import your GitHub repository.
4. The Build Command (`npm run build`) and Output Directory (`dist`) will be automatically detected.
5. Click **Deploy**! 

### Deploying via Vercel CLI
If you want to deploy straight from your terminal:
```bash
npx vercel
```
*Follow the prompts, log in, and let Vercel handle the rest!*

---

## ⚙️ How It Works (The Math)

WakeGuard uses Euclidian distance to measure facial landmarks. 
- **EAR (Eye Aspect Ratio):** `(Vertical_Distance_1 + Vertical_Distance_2) / (2 * Horizontal_Distance)`
- **PERCLOS:** Percentage of eye closure over time. If EAR drops below your baseline by the configured sensitivity (default 80%), a closure frame is registered. If the 50-frame buffer fills with closures, the system triggers a **Drowsy** state.
- **YAW:** Calculated dynamically by comparing the nose tip to the edges of the eyes to detect lateral head rotation.

---

## 🛠️ Built With

- **React 18** (UI Framework)
- **Vite** (Build Tool)
- **Tailwind CSS** (Styling & Animations)
- **Framer Motion** (Micro-interactions)
- **MediaPipe Face Mesh** (AI Vision)
- **Recharts** (Live Telemetry Graphs)

---

*Stay awake. Stay safe.* 🚗💨
