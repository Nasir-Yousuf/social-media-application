package com.clearfeed.telecom

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class CallNotificationReceiver : BroadcastReceiver() {

    companion object {
        var actionListener: ((action: String, data: Map<String, Any?>) -> Unit)? = null
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        when (action) {
            CallForegroundService.ACTION_HANGUP -> {
                actionListener?.invoke("hangup", emptyMap())
                // Immediately stop foreground service
                val stopIntent = Intent(context, CallForegroundService::class.java).apply {
                    this.action = CallForegroundService.ACTION_STOP
                }
                context.startService(stopIntent)
            }
            CallForegroundService.ACTION_MUTE_TOGGLE -> {
                actionListener?.invoke("mute_toggle", emptyMap())
            }
            "com.clearfeed.telecom.ACCEPT_CALL" -> {
                val callId = intent.getStringExtra("callId") ?: ""
                actionListener?.invoke("accept_call", mapOf("callId" to callId))
            }
            "com.clearfeed.telecom.DECLINE_CALL" -> {
                val callId = intent.getStringExtra("callId") ?: ""
                actionListener?.invoke("decline_call", mapOf("callId" to callId))
            }
        }
    }
}
