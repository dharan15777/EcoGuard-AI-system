#include <iostream>

class RiskCalculator {
public:
    static std::string calculateRiskCategory(float score) {
        if (score >= 0.85f) return "CRITICAL";
        if (score >= 0.60f) return "HIGH";
        if (score >= 0.35f) return "MODERATE";
        return "LOW";
    }
};
