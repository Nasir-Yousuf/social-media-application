package com.clearfeed.mesh

import android.os.Handler
import android.os.Looper
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ClearFeedBleMeshModule : Module() {
    private var meshService: BleMeshService? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun definition() = ModuleDefinition {
        Name("ClearFeedBleMesh")

        Events("onMeshPacketReceived", "onPeerDiscovered", "onPeerLost")

        OnCreate {
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                meshService = BleMeshService(ctx)
                meshService?.onPacketReceived = { rawString ->
                    mainHandler.post {
                        sendEvent("onMeshPacketReceived", mapOf("raw" to rawString))
                    }
                }
                meshService?.onPeerDiscovered = { peerId, nickname ->
                    mainHandler.post {
                        sendEvent("onPeerDiscovered", mapOf(
                            "peerId" to peerId,
                            "nickname" to nickname,
                            "rssi" to -65
                        ))
                    }
                }
                meshService?.onPeerLost = { peerId ->
                    mainHandler.post {
                        sendEvent("onPeerLost", mapOf("peerId" to peerId))
                    }
                }
            }
        }

        AsyncFunction("startMesh") { nodeId: String, serviceUuid: String?, characteristicUuid: String? ->
            meshService?.start(nodeId) ?: false
        }

        AsyncFunction("stopMesh") {
            meshService?.stop()
            true
        }

        AsyncFunction("sendBlePacket") { payloadString: String ->
            meshService?.sendPacket(payloadString) ?: false
        }

        AsyncFunction("isBluetoothEnabled") {
            meshService?.isBluetoothEnabled() ?: false
        }
    }
}
