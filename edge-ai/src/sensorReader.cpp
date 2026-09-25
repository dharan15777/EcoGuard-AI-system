#include <iostream>
#include <cstdlib>

struct SensorData {
    float waterLevel;
    float temperature;
    float humidity;
    float soilMoisture;
    float pm25;
};

class SensorReader {
public:
    SensorData sampleAllSensors() {
        SensorData data;
        data.waterLevel = 2.45f + ((float)rand() / RAND_MAX) * 0.3f;
        data.temperature = 25.1f + ((float)rand() / RAND_MAX) * 1.2f;
        data.humidity = 62.0f;
        data.soilMoisture = 44.5f;
        data.pm25 = 18.2f;
        return data;
    }
};
