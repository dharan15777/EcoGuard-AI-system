#include <iostream>
#include "loraConfig.h"

class LoRaClient {
public:
    bool initialize() {
        std::cout << "[LoRaWAN] Initializing Semtech SX1276 LoRa transceiver at " 
                  << LORA_FREQUENCY << " MHz..." << std::endl;
        std::cout << "[LoRaWAN] Spreading Factor SF" << LORA_SPREADING_FACTOR 
                  << ", BW " << LORA_BANDWIDTH << " kHz configured." << std::endl;
        return true;
    }

    bool sendTelemetry(const LoRaPacket& packet) {
        std::cout << "[LoRaWAN TX] Transmitting Packet Node #" << packet.node_id 
                  << " | Hazard Code: " << (int)packet.hazard_type 
                  << " | Value: " << packet.telemetry_val 
                  << " | Batt: " << packet.battery_level << "%" << std::endl;
        return true;
    }
};
