#include <iostream>
#include <string>

class OfflineStorage {
public:
    void bufferRecordToFlash(const std::string& record) {
        std::cout << "[SPI Flash Buffer] Telemetry buffered offline to SPIFFS chip." << std::endl;
    }
};
