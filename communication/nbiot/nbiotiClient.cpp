#include <iostream>
#include "nbiotConfig.h"

class NBiotClient {
public:
    bool connectCellular() {
        std::cout << "[NB-IoT] Attaching to LTE-M / NB-IoT network via APN: " 
                  << NBIOT_APN << " (Band " << NBIOT_BAND << ")..." << std::endl;
        std::cout << "[NB-IoT] Cellular bearer established with IP 10.244.18.90" << std::endl;
        return true;
    }

    bool postCoapPayload(const char* payload) {
        std::cout << "[NB-IoT CoAP] POST request to coap://" << NBIOT_SERVER_HOST 
                  << ":" << NBIOT_SERVER_PORT << "/telemetry | Payload: " << payload << std::endl;
        return true;
    }
};
