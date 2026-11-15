package com.clearfeed.mesh

import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import com.bitchat.android.service.MeshForegroundService
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ClearFeedBleMeshModule : Module() {
    private var meshService: BleMeshService? = null
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun definition() = ModuleDefinition {
        Name("ClearFeedBleMesh")

        Events(
            "onMeshPacketReceived",
            "onPeerDiscovered",
            "onPeerLost",
            "onChunkReceived",
            "onNeighborWriteComplete",
            "onTransportStateChanged"
        )

        OnCreate {
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                meshService = BleMeshService(ctx)

                meshService?.onPeerDiscovered = { peerId, peerAddress, rssi, nickname, mtu, truncatedPubkey ->
                    mainHandler.post {
                        sendEvent("onPeerDiscovered", mapOf(
                            "peerId" to peerId,
                            "peerAddress" to peerAddress,
                            "rssi" to rssi,
                            "nickname" to nickname,
                            "mtu" to mtu,
                            "truncatedPubkey" to truncatedPubkey
                        ))
                    }
                }

                meshService?.onPeerLost = { peerId ->
                    mainHandler.post {
                        sendEvent("onPeerLost", mapOf("peerId" to peerId))
                    }
                }

                meshService?.onChunkReceived = { peerId, chunkHex, frameShortId, fragIdx, totalFrags ->
                    mainHandler.post {
                        sendEvent("onChunkReceived", mapOf(
                            "peerId" to peerId,
                            "chunkHex" to chunkHex,
                            "frameShortId" to frameShortId,
                            "fragIdx" to fragIdx,
                            "totalFrags" to totalFrags
                        ))
                    }
                }

                meshService?.onNeighborWriteComplete = { peerId, success, bytesWritten ->
                    mainHandler.post {
                        sendEvent("onNeighborWriteComplete", mapOf(
                            "peerId" to peerId,
                            "success" to success,
                            "bytesWritten" to bytesWritten,
                            "status" to if (success) "SENT_TO_NEIGHBOR" else "FAILED"
                        ))
                    }
                }

                meshService?.onTransportStateChanged = { isScanning, isAdvertising, connectedPeerCount, defaultMtu ->
                    mainHandler.post {
                        sendEvent("onTransportStateChanged", mapOf(
                            "isScanning" to isScanning,
                            "isAdvertising" to isAdvertising,
                            "connectedPeerCount" to connectedPeerCount,
                            "defaultMtu" to defaultMtu
                        ))
                    }
                }

                meshService?.onLegacyPacketReceived = { rawString ->
                    mainHandler.post {
                        sendEvent("onMeshPacketReceived", mapOf("raw" to rawString))
                    }
                }
            }
        }

        AsyncFunction("startMesh") { nodeId: String, truncatedPubkeyHex: String?, syncHashHex: String? ->
            meshService?.start(nodeId, truncatedPubkeyHex ?: "", syncHashHex ?: "") ?: false
        }

        AsyncFunction("stopMesh") {
            meshService?.stop()
            true
        }

        AsyncFunction("sendChunk") { peerId: String?, chunkHex: String ->
            meshService?.sendChunk(peerId, chunkHex) ?: false
        }

        AsyncFunction("broadcastChunk") { chunkHex: String ->
            meshService?.sendChunk(null, chunkHex) ?: false
        }

        AsyncFunction("sendBlePacket") { payloadString: String ->
            // Legacy wrapper: sends string payload
            val hex = payloadString.toByteArray().joinToString("") { "%02x".format(it) }
            meshService?.sendChunk(null, hex) ?: false
        }

        AsyncFunction("isBluetoothEnabled") {
            meshService?.isBluetoothEnabled() ?: false
        }

        AsyncFunction("getConnectedPeers") {
            meshService?.getConnectedPeersList() ?: emptyList<Map<String, Any>>()
        }

        AsyncFunction("startForegroundService") { title: String?, body: String? ->
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                MeshForegroundService.start(ctx)
                true
            } else {
                false
            }
        }

        AsyncFunction("stopForegroundService") {
            val ctx = appContext.reactContext ?: appContext.currentActivity?.applicationContext
            if (ctx != null) {
                MeshForegroundService.stop(ctx)
                true
            } else {
                false
            }
        }
    }
}
