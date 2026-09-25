# 🏛️ EcoGuard System Architecture

## Architecture Diagram

```
+-------------------------------------------------------------+
|                  Edge-AI IoT Micro-Nodes                   |
|  [Ultrasonic / IR Thermal / Soil Moisture / AQI Sensors]   |
|         │                                                   |
|         ▼ (TensorFlow Lite Micro INT8 Inference)             |
+-------------------------------------------------------------+
                              │
                    (LoRaWAN / NB-IoT / MQTT)
                              │
                              ▼
+-------------------------------------------------------------+
|               Node.js Express Backend Service               |
|  - Real-time Telemetry Ingestion Engine                     |
|  - Risk Scoring & Threshold Evaluator                       |
|  - Emergency Dispatcher (SMS, Email, Push, Sirens)          |
+-------------------------------------------------------------+
                              │
                              ▼
+-------------------------------------------------------------+
|                  React Modern Dashboard                     |
|  - Live GIS Map Overlay (Leaflet/Mapbox)                   |
|  - Hazard Analytics & Real-Time Charts                      |
+-------------------------------------------------------------+
```
