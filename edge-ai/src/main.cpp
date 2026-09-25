#include <iostream>
#include <chrono>
#include <thread>
#include "sensorReader.cpp"
#include "aiInference.cpp"
#include "riskCalculator.cpp"
#include "communicationHandler.cpp"
#include "offlineStorage.cpp"
#include "powerManagement.cpp"

int main() {
    std::cout << "=================================================" << std::endl;
    std::cout << "🌱 EcoGuard Edge-AI Micro-Node Firmware v4.2.1" << std::endl;
    std::cout << "=================================================" << std::endl;

    SensorReader reader;
    AIInferenceEngine aiEngine;
    CommunicationHandler comms;
    OfflineStorage storage;
    PowerManager power;

    aiEngine.loadModel("flood_detection.tflite");

    for (int cycle = 1; cycle <= 3; ++cycle) {
        std::cout << "\n[Cycle " << cycle << "] Sampling environmental sensors..." << std::endl;
        SensorData sample = reader.sampleAllSensors();

        float riskScore = aiEngine.predictRiskScore(sample.waterLevel, sample.soilMoisture);
        std::string riskLevel = RiskCalculator::calculateRiskCategory(riskScore);

        std::cout << "-> Water Level: " << sample.waterLevel << " m" << std::endl;
        std::cout << "-> Temp: " << sample.temperature << " C | Humidity: " << sample.humidity << " %" << std::endl;
        std::cout << "-> Evaluated Risk Score: " << riskScore << " [" << riskLevel << "]" << std::endl;

        std::string payload = "{\"node_id\":\"SN-FLD-01\",\"waterLevel\":" + std::to_string(sample.waterLevel) +
                              ",\"riskScore\":" + std::to_string(riskScore) + "}";

        comms.transmitPayload(payload);
        storage.bufferRecordToFlash(payload);

        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }

    power.enterDeepSleep(30);
    return 0;
}
