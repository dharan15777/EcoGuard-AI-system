#!/usr/bin/env python3
"""
EcoGuard Edge AI Sensor Node Runtime (Python Reference Implementation)
Runs local TensorFlow Lite inference, calculates environmental risk index,
and streams telemetry over LoRaWAN / MQTT.
"""

import time
import json
import random
import sys

class EdgeNodeRuntime:
    def __init__(self, node_id="SN-FLD-01"):
        self.node_id = node_id
        self.battery_level = 98.5
        self.is_running = True
        print(f"[Edge-AI] Booting EcoGuard MicroNode #{self.node_id}...")
        print(f"[Edge-AI] Loaded TFLite Model: flood_detection.tflite (INT8 Quantized)")

    def read_sensors(self):
        # Simulated multi-modal sensor sampling
        return {
            "waterLevel": round(2.3 + random.uniform(-0.1, 0.4), 2),
            "temperature": round(24.0 + random.uniform(-0.5, 0.5), 1),
            "humidity": round(65.0 + random.uniform(-2, 2), 1),
            "soilMoisture": round(42.0 + random.uniform(-1, 1), 1)
        }

    def run_ai_inference(self, telemetry):
        # Mock TensorFlow Lite tensor evaluation
        water_level = telemetry["waterLevel"]
        if water_level > 4.5:
            risk_score = 0.95
            classification = "CRITICAL_FLOOD_WARNING"
        elif water_level > 3.5:
            risk_score = 0.65
            classification = "MODERATE_ELEVATION"
        else:
            risk_score = 0.12
            classification = "NORMAL"
        return risk_score, classification

    def step(self):
        telemetry = self.read_sensors()
        risk_score, classification = self.run_ai_inference(telemetry)
        self.battery_level -= 0.001

        payload = {
          "sensorId": self.node_id,
          "telemetry": telemetry,
          "riskScore": risk_score,
          "inferenceResult": classification,
          "batteryLevel": round(self.battery_level, 2),
          "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        print(f"[Telemetry Step] {payload['timestamp']} | Risk: {risk_score} ({classification}) | Water: {telemetry['waterLevel']}m")
        return payload

if __name__ == "__main__":
    node = EdgeNodeRuntime()
    for _ in range(5):
        node.step()
        time.sleep(1)
