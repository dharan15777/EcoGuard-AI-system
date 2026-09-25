#ifndef LORA_CONFIG_H
#define LORA_CONFIG_H

#define LORA_FREQUENCY 915.0 // MHz (US915 Band)
#define LORA_BANDWIDTH 125.0 // kHz
#define LORA_SPREADING_FACTOR 7
#define LORA_CODING_RATE 5
#define LORA_PREAMBLE_LENGTH 8
#define LORA_TX_POWER 14 // dBm
#define LORA_SYNC_WORD 0x12

typedef struct {
    uint32_t node_id;
    uint8_t hazard_type;
    float telemetry_val;
    float battery_level;
    uint32_t timestamp;
} LoRaPacket;

#endif // LORA_CONFIG_H
