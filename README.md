# 🌿 EcoGuard AI System
> **Enterprise AI-Powered Environmental Monitoring, Disaster Early Warning & Edge-AI IoT Infrastructure Platform**

---

## 🚀 Overview

**EcoGuard AI System** is an end-to-end, multi-tier environmental intelligence platform designed for real-time monitoring, natural hazard detection (floods, wildfires, landslides, hazardous air pollution), edge AI risk scoring, and automated emergency alert dispatching.

Combining low-power Edge AI sensor micro-nodes (TensorFlow Lite micro), LoRaWAN/NB-IoT communication backhaul, distributed Node.js microservices, and interactive modern GIS/Dashboard visualizers, EcoGuard empowers environmental agencies and disaster management teams with actionable early warnings.

---

## 📐 System Architecture Overview

```
 [ IoT Sensors & Drone Swarms ]
               │ (LoRaWAN / NB-IoT / MQTT)
               ▼
   [ Edge-AI Micro-Nodes ] ──── TensorFlow Lite Models (Flood/Fire/AQI/Landslide)
               │ (Real-time telemetry / Risk evaluation)
               ▼
    [ Backend Microservices ] ─── Node.js / Express / Socket Server / MongoDB / SQL
               │
      ┌────────┴────────┐
      ▼                 ▼
[ React Web GIS ]  [ Mobile Alert App ] ── Automated Alerts (SMS / Push / Siren)
```

---

## 📁 Repository Structure

```
environmental-monitoring-system/
├── 📁 backend/          # REST APIs, Real-Time WebSockets, Risk Services & Cron Jobs
├── 📁 edge-ai/           # C++/Python Micro-node Runtime, TFLite Models & Hardware Drivers
├── 📁 frontend/          # React + Vite Interactive GIS & Telemetry Dashboard
├── 📁 mobile-app/        # Android & iOS Native Emergency Mobile Client Components
├── 📁 database/          # SQL Schemas, Migrations, and Initial Data Seeds
├── 📁 communication/     # LoRaWAN, NB-IoT, MQTT, and WebSocket Protocol Drivers
├── 📁 notifications/     # Multi-channel Emergency Dispatchers (SMS, Email, Push, Siren)
├── 📁 tests/              # Unit, Integration, and End-to-End Test Suite
├── 📁 docs/               # System Architecture, API Specifications, & Deployment Manuals
├── 📁 scripts/            # Telemetry Simulators, Database Backups, & Deployment Helpers
└── 📁 docker/             # Containerization, Nginx, & Docker Compose Orchestration
```

---

## ⚡ Quick Start

### 1. Install Backend Dependencies
```bash
cd backend
npm install
npm start
```

### 2. Run Telemetry Simulator
Simulate 25+ deployed environmental sensors streaming real-time data:
```bash
node scripts/simulator.js
```

### 3. Launch Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the EcoGuard Live GIS & Analytics Command Center.

---

## 📄 Documentation

- [System Architecture Guide](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Sensor Hardware Setup](docs/SENSOR_CONFIG.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [User Manual](docs/USER_GUIDE.md)

---

## 🛡️ License
Released under the [MIT License](LICENSE).