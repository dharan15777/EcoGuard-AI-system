package com.ecoguard.app;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;

public class AlertService extends Service {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        System.out.println("Background EcoGuard Push Notification Listener Active");
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }
}
