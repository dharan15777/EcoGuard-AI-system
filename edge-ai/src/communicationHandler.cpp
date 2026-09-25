#include <iostream>
#include <string>

class CommunicationHandler {
public:
    void transmitPayload(const std::string& jsonString) {
        std::cout << "[Comms Driver] Transmitting payload over active LoRaWAN RF channel: " << jsonString << std::endl;
    }
};
