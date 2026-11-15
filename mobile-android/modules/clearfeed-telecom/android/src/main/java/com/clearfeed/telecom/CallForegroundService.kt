package com.clearfeed.telecom

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class CallForegroundService : Service() {

    companion object {
        const val NOTIFICATION_ID = 51899
        const val CHANNEL_ID = "calls_channel"
        const val ACTION_START = "com.clearfeed.telecom.START"
        const val ACTION_STOP = "com.clearfeed.telecom.STOP"
        const val ACTION_MUTE_TOGGLE = "com.clearfeed.telecom.MUTE_TOGGLE"
        const val ACTION_HANGUP = "com.clearfeed.telecom.HANGUP"

        const val EXTRA_PEER_NAME = "extra_peer_name"
        const val EXTRA_IS_MUTED = "extra_is_muted"

        var isServiceRunning = false
        var currentPeerName: String = "Clearfeed User"
        var isCallMuted: Boolean = false
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START

        when (action) {
            ACTION_STOP -> {
                stopForeground(true)
                stopSelf()
                isServiceRunning = false
                return START_NOT_STICKY
            }
            ACTION_MUTE_TOGGLE -> {
                isCallMuted = !isCallMuted
                val notification = buildNotification(currentPeerName, isCallMuted)
                val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                manager.notify(NOTIFICATION_ID, notification)
            }
            else -> {
                val peerName = intent?.getStringExtra(EXTRA_PEER_NAME) ?: currentPeerName
                currentPeerName = peerName
                isCallMuted = intent?.getBooleanExtra(EXTRA_IS_MUTED, false) ?: false

                val notification = buildNotification(peerName, isCallMuted)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    var serviceType = ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                        serviceType = serviceType or ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE
                    }
                    startForeground(NOTIFICATION_ID, notification, serviceType)
                } else {
                    startForeground(NOTIFICATION_ID, notification)
                }
                isServiceRunning = true
            }
        }

        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Voice Calls",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Ongoing 1:1 Clearfeed Voice Call Notifications"
                setSound(null, null)
                enableVibration(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(peerName: String, isMuted: Boolean): Notification {
        // Launch main activity on tap
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val contentPendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        // Hangup action
        val hangupIntent = Intent(this, CallNotificationReceiver::class.java).apply {
            action = ACTION_HANGUP
        }
        val hangupPendingIntent = PendingIntent.getBroadcast(
            this,
            1,
            hangupIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        // Mute toggle action
        val muteIntent = Intent(this, CallNotificationReceiver::class.java).apply {
            action = ACTION_MUTE_TOGGLE
        }
        val mutePendingIntent = PendingIntent.getBroadcast(
            this,
            2,
            muteIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        val muteText = if (isMuted) "Unmute" else "Mute"

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Clearfeed Audio Call in Progress")
            .setContentText("Connected with $peerName")
            .setSmallIcon(android.R.drawable.sym_call_incoming)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setContentIntent(contentPendingIntent)
            .addAction(android.R.drawable.ic_lock_silent_mode, muteText, mutePendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Hang Up", hangupPendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
    }
}
