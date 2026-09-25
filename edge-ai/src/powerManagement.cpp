#include <iostream>

class PowerManager {
public:
    void enterDeepSleep(uint32_t seconds) {
        std::cout << "[PowerMgmt] Microcontroller entering Deep Sleep mode for " << seconds << " seconds..." << std::endl;
    }
};
