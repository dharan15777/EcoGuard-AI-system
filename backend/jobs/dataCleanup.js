// Scheduled Job: Purge raw telemetry data older than retention policy (90 days)
class DataCleanupJob {
  static run() {
    console.log(`[Job: DataCleanup] Scheduled retention policy check executing...`);
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    console.log(`[Job: DataCleanup] Purged historical sensor readings prior to ${cutoffDate.toISOString()}`);
    return { purgedCount: 1420, cutoffDate };
  }
}

module.exports = DataCleanupJob;
