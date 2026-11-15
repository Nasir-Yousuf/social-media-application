package com.clearfeed.telecom

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ClearFeedTelecomModule : Module() {

    private val mainHandler = Handler(Looper.getMainLooper())
    private var audioManager: AudioManager? = null
    private var powerManager: PowerManager? = null
    private var proximityWakeLock: PowerManager.WakeLock? = null
    private var audioFocusRequest: AudioFocusRequest? = null

    private var previousAudioMode: Int = AudioManager.MODE_NORMAL
    private var previousSpeakerState: Boolean = false
    private var isCallAudioActive: Boolean = false
    private var currentRoute: String = "EARPIECE"

    private val INCOMING_CALL_NOTIFICATION_ID = 51888
    private val CALLS_CHANNEL_ID = "calls_channel"

    private val audioFocusChangeListener = AudioManager.OnAudioFocusChangeListener { focusChange ->
        mainHandler.post {
            when (focusChange) {
                AudioManager.AUDIOFOCUS_LOSS,
                AudioManager.AUDIOFOCUS_LOSS_TRANSIENT,
                AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> {
                    sendEvent("onAudioFocusChanged", mapOf(
                        "isFocused" to false,
                        "type" to "loss"
                    ))
                }
                AudioManager.AUDIOFOCUS_GAIN -> {
                    sendEvent("onAudioFocusChanged", mapOf(
                        "isFocused" to true,
                        "type" to "gain"
                    ))
                }
            }
        }
    }

    override fun definition() = ModuleDefinition {
        Name("ClearFeedTelecom")

        Events("onAudioRouteChanged", "onAudioFocusChanged", "onCallNotificationAction")

        OnCreate {
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                audioManager = ctx.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
                powerManager = ctx.getSystemService(Context.POWER_SERVICE) as? PowerManager

                // Hook up CallNotificationReceiver listener
                CallNotificationReceiver.actionListener = { action, data ->
                    mainHandler.post {
                        sendEvent("onCallNotificationAction", mapOf(
                            "action" to action,
                            "data" to data
                        ))
                    }
                }
            }
        }

        OnDestroy {
            stopCallAudioInternal()
        }

        // ==========================================
        // 1. CALL AUDIO SESSION (MODE_IN_COMMUNICATION)
        // ==========================================
        AsyncFunction("startCallAudio") {
            val am = audioManager ?: return@AsyncFunction false
            if (isCallAudioActive) return@AsyncFunction true

            previousAudioMode = am.mode
            previousSpeakerState = am.isSpeakerphoneOn

            // Set communication mode for VoIP calling
            am.mode = AudioManager.MODE_IN_COMMUNICATION

            // Request Audio Focus
            requestAudioFocus()

            // Default to earpiece
            routeToEarpiece()
            isCallAudioActive = true

            mainHandler.post {
                sendEvent("onAudioRouteChanged", mapOf("route" to currentRoute))
            }
            true
        }

        AsyncFunction("stopCallAudio") {
            stopCallAudioInternal()
            true
        }

        // ==========================================
        // 2. AUDIO ROUTING (Earpiece, Speaker, Bluetooth)
        // ==========================================
        AsyncFunction("setSpeakerphoneOn") { enabled: Boolean ->
            val am = audioManager ?: return@AsyncFunction false
            if (enabled) {
                routeToSpeaker()
            } else {
                routeToEarpiece()
            }
            mainHandler.post {
                sendEvent("onAudioRouteChanged", mapOf("route" to currentRoute))
            }
            true
        }

        AsyncFunction("setBluetoothScoOn") { enabled: Boolean ->
            val am = audioManager ?: return@AsyncFunction false
            if (enabled) {
                routeToBluetooth()
            } else {
                routeToEarpiece()
            }
            mainHandler.post {
                sendEvent("onAudioRouteChanged", mapOf("route" to currentRoute))
            }
            true
        }

        AsyncFunction("setAudioRoute") { route: String ->
            when (route.uppercase()) {
                "SPEAKER" -> routeToSpeaker()
                "BLUETOOTH" -> routeToBluetooth()
                else -> routeToEarpiece()
            }
            mainHandler.post {
                sendEvent("onAudioRouteChanged", mapOf("route" to currentRoute))
            }
            true
        }

        AsyncFunction("getAvailableAudioRoutes") {
            val routes = mutableListOf("EARPIECE", "SPEAKER")
            val am = audioManager
            if (am != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val devices = am.availableCommunicationDevices
                    for (d in devices) {
                        if (d.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO || d.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP) {
                            if (!routes.contains("BLUETOOTH")) routes.add("BLUETOOTH")
                        } else if (d.type == AudioDeviceInfo.TYPE_WIRED_HEADSET || d.type == AudioDeviceInfo.TYPE_WIRED_HEADPHONES) {
                            if (!routes.contains("WIRED_HEADSET")) routes.add("WIRED_HEADSET")
                        }
                    }
                } else {
                    if (am.isBluetoothScoAvailableOffCall || am.isBluetoothA2dpOn) {
                        routes.add("BLUETOOTH")
                    }
                    if (am.isWiredHeadsetOn) {
                        routes.add("WIRED_HEADSET")
                    }
                }
            }
            routes
        }

        AsyncFunction("getCurrentAudioRoute") {
            currentRoute
        }

        // ==========================================
        // 3. PROXIMITY SENSOR SCREEN-OFF HANDLING
        // ==========================================
        AsyncFunction("enableProximitySensor") {
            enableProximityWakeLock()
            true
        }

        AsyncFunction("disableProximitySensor") {
            disableProximityWakeLock()
            true
        }

        // ==========================================
        // 4. ANDROID FOREGROUND SERVICE
        // ==========================================
        AsyncFunction("startCallForegroundService") { peerName: String ->
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                val serviceIntent = Intent(ctx, CallForegroundService::class.java).apply {
                    action = CallForegroundService.ACTION_START
                    putExtra(CallForegroundService.EXTRA_PEER_NAME, peerName)
                }
                ContextCompat.startForegroundService(ctx, serviceIntent)
            }
            true
        }

        AsyncFunction("stopCallForegroundService") {
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                val serviceIntent = Intent(ctx, CallForegroundService::class.java).apply {
                    action = CallForegroundService.ACTION_STOP
                }
                ctx.startService(serviceIntent)
            }
            true
        }

        // ==========================================
        // 5. HEADS-UP INCOMING CALL NOTIFICATION
        // ==========================================
        AsyncFunction("showIncomingCallNotification") { callId: String, callerName: String, callerAvatar: String? ->
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                showIncomingNotification(ctx, callId, callerName)
            }
            true
        }

        AsyncFunction("dismissIncomingCallNotification") {
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                val notificationManager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                notificationManager.cancel(INCOMING_CALL_NOTIFICATION_ID)
            }
            true
        }
    }

    private fun routeToEarpiece() {
        val am = audioManager ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val earpieceDevice = am.availableCommunicationDevices.firstOrNull {
                it.type == AudioDeviceInfo.TYPE_BUILTIN_EARPIECE
            }
            if (earpieceDevice != null) {
                am.setCommunicationDevice(earpieceDevice)
            } else {
                am.clearCommunicationDevice()
            }
        } else {
            if (am.isBluetoothScoOn) {
                am.stopBluetoothSco()
                am.isBluetoothScoOn = false
            }
            am.isSpeakerphoneOn = false
        }
        currentRoute = "EARPIECE"
        enableProximityWakeLock()
    }

    private fun routeToSpeaker() {
        val am = audioManager ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val speakerDevice = am.availableCommunicationDevices.firstOrNull {
                it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
            }
            if (speakerDevice != null) {
                am.setCommunicationDevice(speakerDevice)
            } else {
                am.isSpeakerphoneOn = true
            }
        } else {
            if (am.isBluetoothScoOn) {
                am.stopBluetoothSco()
                am.isBluetoothScoOn = false
            }
            am.isSpeakerphoneOn = true
        }
        currentRoute = "SPEAKER"
        // Screen should not turn off when on speakerphone
        disableProximityWakeLock()
    }

    private fun routeToBluetooth() {
        val am = audioManager ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val bluetoothDevice = am.availableCommunicationDevices.firstOrNull {
                it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO || it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP
            }
            if (bluetoothDevice != null) {
                am.setCommunicationDevice(bluetoothDevice)
                currentRoute = "BLUETOOTH"
                disableProximityWakeLock()
                return
            }
        }

        try {
            am.startBluetoothSco()
            am.isBluetoothScoOn = true
            currentRoute = "BLUETOOTH"
        } catch (_: Exception) {}
        disableProximityWakeLock()
    }

    private fun requestAudioFocus() {
        val am = audioManager ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val attributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()

            val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                .setAudioAttributes(attributes)
                .setAcceptsDelayedFocusGain(true)
                .setOnAudioFocusChangeListener(audioFocusChangeListener)
                .build()

            audioFocusRequest = request
            am.requestAudioFocus(request)
        } else {
            @Suppress("DEPRECATION")
            am.requestAudioFocus(
                audioFocusChangeListener,
                AudioManager.STREAM_VOICE_CALL,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
            )
        }
    }

    private fun abandonAudioFocus() {
        val am = audioManager ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest?.let { am.abandonAudioFocusRequest(it) }
            audioFocusRequest = null
        } else {
            @Suppress("DEPRECATION")
            am.abandonAudioFocus(audioFocusChangeListener)
        }
    }

    private fun enableProximityWakeLock() {
        if (proximityWakeLock?.isHeld == true) return
        val pm = powerManager ?: return

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                if (pm.isWakeLockLevelSupported(PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK)) {
                    proximityWakeLock = pm.newWakeLock(
                        PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK,
                        "clearfeed:proximity_wakelock"
                    ).apply {
                        setReferenceCounted(false)
                        acquire(60 * 60 * 1000L) // 1 hr max safe release
                    }
                }
            }
        } catch (_: Exception) {}
    }

    private fun disableProximityWakeLock() {
        try {
            if (proximityWakeLock?.isHeld == true) {
                proximityWakeLock?.release()
            }
            proximityWakeLock = null
        } catch (_: Exception) {}
    }

    private fun stopCallAudioInternal() {
        if (!isCallAudioActive) return
        val am = audioManager

        disableProximityWakeLock()
        abandonAudioFocus()

        if (am != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                am.clearCommunicationDevice()
            } else {
                if (am.isBluetoothScoOn) {
                    am.stopBluetoothSco()
                    am.isBluetoothScoOn = false
                }
                am.isSpeakerphoneOn = previousSpeakerState
            }
            am.mode = previousAudioMode
        }

        isCallAudioActive = false
        currentRoute = "EARPIECE"
    }

    private fun showIncomingNotification(context: Context, callId: String, callerName: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CALLS_CHANNEL_ID,
                "Voice Calls",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Incoming and Active Clearfeed Audio Calls"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 800, 1000)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
            }
            notificationManager.createNotificationChannel(channel)
        }

        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val contentPendingIntent = PendingIntent.getActivity(
            context,
            100,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        // Accept Action
        val acceptIntent = Intent(context, CallNotificationReceiver::class.java).apply {
            action = "com.clearfeed.telecom.ACCEPT_CALL"
            putExtra("callId", callId)
        }
        val acceptPendingIntent = PendingIntent.getBroadcast(
            context,
            101,
            acceptIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        // Decline Action
        val declineIntent = Intent(context, CallNotificationReceiver::class.java).apply {
            action = "com.clearfeed.telecom.DECLINE_CALL"
            putExtra("callId", callId)
        }
        val declinePendingIntent = PendingIntent.getBroadcast(
            context,
            102,
            declineIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        val notification = NotificationCompat.Builder(context, CALLS_CHANNEL_ID)
            .setContentTitle("Incoming Clearfeed Audio Call")
            .setContentText("$callerName is calling you...")
            .setSmallIcon(android.R.drawable.sym_call_incoming)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setAutoCancel(true)
            .setOngoing(true)
            .setContentIntent(contentPendingIntent)
            .setFullScreenIntent(contentPendingIntent, true)
            .addAction(android.R.drawable.ic_menu_call, "Accept", acceptPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Decline", declinePendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()

        notificationManager.notify(INCOMING_CALL_NOTIFICATION_ID, notification)
    }
}
