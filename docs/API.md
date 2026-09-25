# 📖 EcoGuard REST API Reference v1.0

Base URL: `http://localhost:5000/api/v1`

---

## 🛰️ Sensor Management (`/sensors`)

### `GET /sensors`
Returns a list of all registered Edge AI environmental sensors.

**Response `200 OK`**:
```json
{
  "status": "success",
  "count": 6,
  "data": [
    {
      "id": "SN-FLD-01",
      "name": "Pine River Hydro Node Alpha",
      "type": "FLOOD_WATER_LEVEL",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "status": "ONLINE",
      "batteryLevel": 94.2
    }
  ]
}
```

### `POST /sensors/telemetry`
Ingest real-time multi-modal telemetry payload from Edge micro-nodes.

**Request Body**:
```json
{
  "sensorId": "SN-FLD-01",
  "telemetry": {
    "waterLevel": 4.82,
    "temperature": 18.5,
    "humidity": 82.0
  },
  "riskScore": 0.94,
  "inferenceResult": "CRITICAL_FLOOD_RISK",
  "batteryLevel": 93.8
}
```

---

## 🚨 Emergency Alerts (`/alerts`)

### `GET /alerts`
Fetch active or historical hazard alerts. Query parameters: `status`, `severity`.

### `PATCH /alerts/:id/acknowledge`
Mark an active emergency alert as acknowledged by an operator.

---

## 📊 Dashboard KPI (`/dashboard/summary`)
Returns aggregated metrics, active hazard alert feeds, sensor health statuses, and 24h trend analytics.
