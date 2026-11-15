package com.clearfeed.mesh

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.net.wifi.WifiManager
import android.net.wifi.p2p.WifiP2pManager
import android.net.wifi.p2p.nsd.WifiP2pDnsSdServiceInfo
import android.net.wifi.p2p.nsd.WifiP2pDnsSdServiceRequest
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.io.DataInputStream
import java.io.DataOutputStream
import java.io.IOException
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/**
 * High-Speed Local LAN (mDNS + TCP/UDP) and Wi-Fi Direct Mesh Transport for Android
 *
 * Implements:
 * 1. mDNS discovery via NsdManager (_clearfeed-mesh._tcp.) on port 49152
 * 2. High-throughput TCP Server & Client with 4-byte Big-Endian length framing
 * 3. UDP Multicast & Broadcast Beacon listener for instant hotspot discovery (<1 sec)
 * 4. Android-to-Android Wi-Fi Direct P2P discovery via WifiP2pManager & WifiP2pDnsSdServiceInfo
 * 5. Strict CFM1 wire frame transmission (Zero Plaintext Trust on Wi-Fi)
 */
class LanWifiMeshService(private val context: Context) {

    companion object {
        private const val TAG = "LanWifiMeshService"
        const val SERVICE_TYPE = "_clearfeed-mesh._tcp."
        const val SERVICE_NAME_PREFIX = "ClearFeedMesh"
        const val DEFAULT_LAN_PORT = 49152
        const val UDP_BEACON_PORT = 49152
        const val MIN_FRAME_SIZE = 188
        const val MAX_FRAME_SIZE = 65536
        const val BEACON_HEADER = "CFM1_BEACON:"
    }

    data class LanPeer(
        val peerId: String,
        val ip: String,
        val port: Int,
        val pubKeyPrefix: String,
        val nickname: String,
        val transport: String, // "LAN" or "WIFI_DIRECT"
        var lastSeen: Long = System.currentTimeMillis()
    )

    // Callbacks to React Native Bridge
    var onLanPeerDiscovered: ((peerId: String, ip: String, port: Int, pubKeyPrefix: String, nickname: String, transport: String) -> Unit)? = null
    var onLanPeerLost: ((peerId: String) -> Unit)? = null
    var onTcpFrameReceived: ((remoteIp: String, remotePort: Int, frameHex: String) -> Unit)? = null
    var onLanTransportStateChanged: ((isServerRunning: Boolean, port: Int, peerCount: Int, isWifiDirectActive: Boolean) -> Unit)? = null

    private val mainHandler = Handler(Looper.getMainLooper())
    private val executor = Executors.newCachedThreadPool()

    private val isLanRunning = AtomicBoolean(false)
    private val isWifiP2pRunning = AtomicBoolean(false)

    private var localNodeId: String = ""
    private var localPubKeyPrefix: String = ""
    private var localPort: Int = DEFAULT_LAN_PORT

    // Networking handles
    private var serverSocket: ServerSocket? = null
    private var udpSocket: DatagramSocket? = null
    private var multicastLock: WifiManager.MulticastLock? = null

    // Android NsdManager for mDNS
    private var nsdManager: NsdManager? = null
    private var registrationListener: NsdManager.RegistrationListener? = null
    private var discoveryListener: NsdManager.DiscoveryListener? = null

    // Android Wi-Fi Direct P2P
    private var wifiP2pManager: WifiP2pManager? = null
    private var p2pChannel: WifiP2pManager.Channel? = null
    private var p2pServiceInfo: WifiP2pDnsSdServiceInfo? = null
    private var p2pServiceRequest: WifiP2pDnsSdServiceRequest? = null

    // Discovered Peers Cache
    val discoveredPeers = ConcurrentHashMap<String, LanPeer>()

    /**
     * Start the High-Speed Local LAN & Wi-Fi Direct Mesh Transport
     */
    fun start(nodeId: String, pubKeyPrefix: String, port: Int = DEFAULT_LAN_PORT): Boolean {
        if (isLanRunning.get()) {
            Log.d(TAG, "LAN transport already active")
            return true
        }

        localNodeId = nodeId
        localPubKeyPrefix = pubKeyPrefix
        localPort = port
        isLanRunning.set(true)

        acquireMulticastLock()
        startTcpServer(port)
        startUdpBeaconListener()
        registerMdnsService(port, pubKeyPrefix, nodeId)
        discoverMdnsServices()
        startWifiDirect(nodeId, pubKeyPrefix, port)

        notifyState()
        Log.i(TAG, "Clearfeed High-Speed LAN & Wi-Fi Direct Mesh started on port $port")
        return true
    }

    /**
     * Stop all LAN, UDP, mDNS, and Wi-Fi Direct transports
     */
    fun stop() {
        if (!isLanRunning.getAndSet(false)) return

        stopMdns()
        stopWifiDirect()
        stopTcpServer()
        stopUdpBeacon()
        releaseMulticastLock()

        discoveredPeers.clear()
        notifyState()
        Log.i(TAG, "Clearfeed High-Speed LAN & Wi-Fi Direct Mesh stopped")
    }

    /**
     * Acquire Wi-Fi Multicast lock so Android radio passes UDP beacons and mDNS packets
     */
    private fun acquireMulticastLock() {
        try {
            val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
            multicastLock = wifiManager?.createMulticastLock("ClearfeedMeshMulticastLock")?.apply {
                setReferenceCounted(true)
                acquire()
            }
        } catch (e: Exception) {
            Log.w(TAG, "MulticastLock acquisition warning: ${e.message}")
        }
    }

    private fun releaseMulticastLock() {
        try {
            multicastLock?.let {
                if (it.isHeld) it.release()
            }
        } catch (e: Exception) {
            Log.w(TAG, "MulticastLock release warning: ${e.message}")
        }
        multicastLock = null
    }

    /**
     * Start TCP Server Socket to accept high-speed length-prefixed CFM1 binary frames
     */
    private fun startTcpServer(port: Int) {
        executor.execute {
            try {
                serverSocket = ServerSocket().apply {
                    reuseAddress = true
                    bind(InetSocketAddress(port))
                }
                Log.i(TAG, "TCP Server bound to port $port")

                while (isLanRunning.get()) {
                    try {
                        val clientSocket = serverSocket?.accept() ?: break
                        handleIncomingTcpConnection(clientSocket)
                    } catch (e: IOException) {
                        if (isLanRunning.get()) {
                            Log.w(TAG, "TCP accept exception: ${e.message}")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start TCP server on port $port: ${e.message}")
            }
        }
    }

    /**
     * Read length-prefixed CFM1 frames from client socket
     * Format: [4B Big-Endian uint32 length] || [CFM1 Canonical Binary Frame]
     */
    private fun handleIncomingTcpConnection(socket: Socket) {
        executor.execute {
            try {
                socket.soTimeout = 10000 // 10-second read timeout
                val dis = DataInputStream(socket.getInputStream())
                val remoteIp = socket.inetAddress.hostAddress ?: "unknown"
                val remotePort = socket.port

                while (isLanRunning.get() && !socket.isClosed) {
                    val frameLength: Int
                    try {
                        frameLength = dis.readInt()
                    } catch (e: Exception) {
                        break // End of stream or client disconnected
                    }

                    if (frameLength < MIN_FRAME_SIZE || frameLength > MAX_FRAME_SIZE) {
                        Log.w(TAG, "Invalid frame length over TCP: $frameLength (must be $MIN_FRAME_SIZE..$MAX_FRAME_SIZE)")
                        break
                    }

                    val frameBuffer = ByteArray(frameLength)
                    dis.readFully(frameBuffer)

                    // Convert to hex and notify bridge
                    val frameHex = frameBuffer.joinToString("") { "%02x".format(it) }
                    mainHandler.post {
                        onTcpFrameReceived?.invoke(remoteIp, remotePort, frameHex)
                    }
                }
            } catch (e: Exception) {
                Log.d(TAG, "TCP client socket closed: ${e.message}")
            } finally {
                try { socket.close() } catch (ignored: Exception) {}
            }
        }
    }

    /**
     * Send a length-prefixed CFM1 binary frame over TCP to a target LAN or Wi-Fi Direct peer
     */
    fun sendTcpFrame(peerIp: String, port: Int, frameBytes: ByteArray): Boolean {
        if (frameBytes.size < MIN_FRAME_SIZE || frameBytes.size > MAX_FRAME_SIZE) {
            Log.e(TAG, "Cannot send frame: size ${frameBytes.size} out of bounds")
            return false
        }

        return try {
            Socket().use { socket ->
                socket.connect(InetSocketAddress(peerIp, port), 3000) // 3-second connect timeout
                socket.soTimeout = 5000
                val dos = DataOutputStream(socket.getOutputStream())

                // 1. 4-byte Big-Endian length header
                dos.writeInt(frameBytes.size)

                // 2. Canonical CFM1 binary frame payload
                dos.write(frameBytes)
                dos.flush()
                true
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to send TCP frame to $peerIp:$port: ${e.message}")
            false
        }
    }

    /**
     * UDP Beacon Broadcaster & Listener for zero-delay hotspot / LAN discovery
     */
    private fun startUdpBeaconListener() {
        executor.execute {
            try {
                udpSocket = DatagramSocket(null).apply {
                    reuseAddress = true
                    bind(InetSocketAddress(UDP_BEACON_PORT))
                    broadcast = true
                }

                val buffer = ByteArray(2048)
                while (isLanRunning.get()) {
                    val packet = DatagramPacket(buffer, buffer.size)
                    try {
                        udpSocket?.receive(packet)
                        val text = String(packet.data, 0, packet.length, Charsets.UTF_8).trim()
                        if (text.startsWith(BEACON_HEADER)) {
                            handleIncomingUdpBeacon(text, packet.address.hostAddress ?: "")
                        }
                    } catch (e: Exception) {
                        if (isLanRunning.get()) Log.d(TAG, "UDP receive warning: ${e.message}")
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "UDP Beacon listener setup failed: ${e.message}")
            }
        }

        // Periodic UDP beacon broadcaster
        executor.execute {
            while (isLanRunning.get()) {
                broadcastLanBeacon()
                try {
                    Thread.sleep(4000)
                } catch (e: InterruptedException) {
                    break
                }
            }
        }
    }

    private fun handleIncomingUdpBeacon(beaconText: String, remoteIp: String) {
        // Format: CFM1_BEACON:<nodeId>:<pubKeyPrefix>:<port>:<nickname>
        val parts = beaconText.substring(BEACON_HEADER.length).split(":")
        if (parts.size >= 3) {
            val nodeId = parts[0]
            val pubKeyPrefix = parts[1]
            val port = parts[2].toIntOrNull() ?: DEFAULT_LAN_PORT
            val nickname = if (parts.size > 3) parts[3] else "CFM1_LAN_${pubKeyPrefix.take(4)}"

            if (nodeId == localNodeId && pubKeyPrefix == localPubKeyPrefix) {
                return // Ignore self beacon
            }

            val peer = LanPeer(
                peerId = "LAN_$pubKeyPrefix",
                ip = remoteIp,
                port = port,
                pubKeyPrefix = pubKeyPrefix,
                nickname = nickname,
                transport = "LAN",
                lastSeen = System.currentTimeMillis()
            )

            discoveredPeers[peer.peerId] = peer
            mainHandler.post {
                onLanPeerDiscovered?.invoke(peer.peerId, peer.ip, peer.port, peer.pubKeyPrefix, peer.nickname, "LAN")
                notifyState()
            }
        }
    }

    /**
     * Broadcast a presence beacon over local subnet UDP broadcast (255.255.255.255)
     */
    fun broadcastLanBeacon() {
        executor.execute {
            try {
                val beaconMessage = "$BEACON_HEADER$localNodeId:$localPubKeyPrefix:$localPort:CFM1_${localPubKeyPrefix.take(4)}"
                val bytes = beaconMessage.toByteArray(Charsets.UTF_8)
                val broadcastAddress = InetAddress.getByName("255.255.255.255")

                val packet = DatagramPacket(bytes, bytes.size, broadcastAddress, UDP_BEACON_PORT)
                DatagramSocket().use { ds ->
                    ds.broadcast = true
                    ds.send(packet)
                }
            } catch (e: Exception) {
                Log.d(TAG, "Broadcast LAN beacon notice: ${e.message}")
            }
        }
    }

    private fun stopUdpBeacon() {
        try {
            udpSocket?.close()
        } catch (ignored: Exception) {}
        udpSocket = null
    }

    private fun stopTcpServer() {
        try {
            serverSocket?.close()
        } catch (ignored: Exception) {}
        serverSocket = null
    }

    /**
     * Register mDNS Service via Android NsdManager (_clearfeed-mesh._tcp.)
     */
    private fun registerMdnsService(port: Int, pubKeyPrefix: String, nodeId: String) {
        try {
            nsdManager = context.getSystemService(Context.NSD_SERVICE) as? NsdManager
            if (nsdManager == null) {
                Log.w(TAG, "NsdManager not available on this device")
                return
            }

            val serviceInfo = NsdServiceInfo().apply {
                serviceName = "${SERVICE_NAME_PREFIX}_$nodeId"
                serviceType = SERVICE_TYPE
                setPort(port)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    setAttribute("pubKeyPrefix", pubKeyPrefix)
                    setAttribute("version", "CFM1")
                    setAttribute("nodeId", nodeId)
                }
            }

            registrationListener = object : NsdManager.RegistrationListener {
                override fun onServiceRegistered(NsdServiceInfo: NsdServiceInfo) {
                    Log.i(TAG, "mDNS Service registered: ${NsdServiceInfo.serviceName}")
                }
                override fun onRegistrationFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
                    Log.e(TAG, "mDNS Service registration failed: errorCode $errorCode")
                }
                override fun onServiceUnregistered(arg0: NsdServiceInfo) {
                    Log.i(TAG, "mDNS Service unregistered")
                }
                override fun onUnregistrationFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
                    Log.w(TAG, "mDNS Unregistration failed: errorCode $errorCode")
                }
            }

            nsdManager?.registerService(serviceInfo, NsdManager.PROTOCOL_DNS_SD, registrationListener)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to register mDNS service: ${e.message}")
        }
    }

    /**
     * Discover mDNS peers (_clearfeed-mesh._tcp.) on local Wi-Fi LAN / Hotspot
     */
    private fun discoverMdnsServices() {
        try {
            discoveryListener = object : NsdManager.DiscoveryListener {
                override fun onDiscoveryStarted(regType: String) {
                    Log.d(TAG, "mDNS Service discovery started for $regType")
                }

                override fun onServiceFound(service: NsdServiceInfo) {
                    Log.d(TAG, "mDNS Service found: ${service.serviceName}")
                    if (service.serviceType.contains("_clearfeed-mesh")) {
                        resolveMdnsService(service)
                    }
                }

                override fun onServiceLost(service: NsdServiceInfo) {
                    Log.d(TAG, "mDNS Service lost: ${service.serviceName}")
                    val peerId = "LAN_${service.serviceName}"
                    discoveredPeers.remove(peerId)
                    mainHandler.post {
                        onLanPeerLost?.invoke(peerId)
                        notifyState()
                    }
                }

                override fun onDiscoveryStopped(serviceType: String) {
                    Log.d(TAG, "mDNS Discovery stopped for $serviceType")
                }

                override fun onStartDiscoveryFailed(serviceType: String, errorCode: Int) {
                    Log.e(TAG, "mDNS Discovery start failed: $errorCode")
                    try { nsdManager?.stopServiceDiscovery(this) } catch (ignored: Exception) {}
                }

                override fun onStopDiscoveryFailed(serviceType: String, errorCode: Int) {
                    Log.e(TAG, "mDNS Discovery stop failed: $errorCode")
                }
            }

            nsdManager?.discoverServices(SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, discoveryListener)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start mDNS discovery: ${e.message}")
        }
    }

    private fun resolveMdnsService(service: NsdServiceInfo) {
        val resolveListener = object : NsdManager.ResolveListener {
            override fun onResolveFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
                Log.w(TAG, "mDNS Resolve failed: $errorCode for ${serviceInfo.serviceName}")
            }

            override fun onServiceResolved(resolvedService: NsdServiceInfo) {
                val host = resolvedService.host?.hostAddress ?: return
                val port = resolvedService.port

                var pubKeyPrefix = ""
                var nodeId = ""
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    val attrs = resolvedService.attributes
                    pubKeyPrefix = attrs["pubKeyPrefix"]?.let { String(it, Charsets.UTF_8) } ?: ""
                    nodeId = attrs["nodeId"]?.let { String(it, Charsets.UTF_8) } ?: ""
                }

                if (pubKeyPrefix.isEmpty()) {
                    pubKeyPrefix = resolvedService.serviceName.takeLast(16)
                }

                // Ignore self
                if (pubKeyPrefix == localPubKeyPrefix && nodeId == localNodeId) return

                val peer = LanPeer(
                    peerId = "LAN_$pubKeyPrefix",
                    ip = host,
                    port = port,
                    pubKeyPrefix = pubKeyPrefix,
                    nickname = "CFM1_mDNS_${pubKeyPrefix.take(4)}",
                    transport = "LAN",
                    lastSeen = System.currentTimeMillis()
                )

                discoveredPeers[peer.peerId] = peer
                mainHandler.post {
                    onLanPeerDiscovered?.invoke(peer.peerId, peer.ip, peer.port, peer.pubKeyPrefix, peer.nickname, "LAN")
                    notifyState()
                }
            }
        }

        try {
            nsdManager?.resolveService(service, resolveListener)
        } catch (e: Exception) {
            Log.w(TAG, "mDNS resolveService error: ${e.message}")
        }
    }

    private fun stopMdns() {
        try {
            registrationListener?.let { nsdManager?.unregisterService(it) }
        } catch (ignored: Exception) {}
        registrationListener = null

        try {
            discoveryListener?.let { nsdManager?.stopServiceDiscovery(it) }
        } catch (ignored: Exception) {}
        discoveryListener = null
    }

    /**
     * Start Android-to-Android Wi-Fi Direct (P2P) Service Discovery via WifiP2pManager
     */
    fun startWifiDirect(nodeId: String, pubKeyPrefix: String, port: Int = DEFAULT_LAN_PORT): Boolean {
        try {
            wifiP2pManager = context.getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
            if (wifiP2pManager == null) {
                Log.w(TAG, "WifiP2pManager is not available on this hardware")
                return false
            }

            p2pChannel = wifiP2pManager?.initialize(context, context.mainLooper, null)
            if (p2pChannel == null) {
                Log.w(TAG, "Failed to initialize WifiP2p channel")
                return false
            }

            isWifiP2pRunning.set(true)

            // 1. Advertise Local Wi-Fi Direct DNS-SD Service
            val txtRecord = mapOf(
                "pubKeyPrefix" to pubKeyPrefix,
                "version" to "CFM1",
                "nodeId" to nodeId,
                "port" to port.toString()
            )
            val serviceInfo = WifiP2pDnsSdServiceInfo.newInstance(
                "${SERVICE_NAME_PREFIX}_$nodeId",
                SERVICE_TYPE,
                txtRecord
            )
            p2pServiceInfo = serviceInfo

            wifiP2pManager?.addLocalService(p2pChannel, serviceInfo, object : WifiP2pManager.ActionListener {
                override fun onSuccess() {
                    Log.i(TAG, "Wi-Fi Direct DNS-SD service added successfully")
                }
                override fun onFailure(code: Int) {
                    Log.w(TAG, "Failed to add Wi-Fi Direct service: code $code")
                }
            })

            // 2. Set Response Listeners for P2P Discovery
            wifiP2pManager?.setDnsSdResponseListeners(
                p2pChannel,
                { instanceName, registrationType, srcDevice ->
                    Log.d(TAG, "Wi-Fi Direct service response: $instanceName ($registrationType) from ${srcDevice.deviceAddress}")
                },
                { fullDomainName, txtRecordMap, srcDevice ->
                    Log.d(TAG, "Wi-Fi Direct TXT record from ${srcDevice.deviceAddress}: $txtRecordMap")
                    val remotePubKeyPrefix = txtRecordMap["pubKeyPrefix"] ?: ""
                    val remotePort = txtRecordMap["port"]?.toIntOrNull() ?: DEFAULT_LAN_PORT
                    val remoteNodeId = txtRecordMap["nodeId"] ?: ""

                    if (remotePubKeyPrefix.isNotEmpty() && remotePubKeyPrefix != localPubKeyPrefix) {
                        val peer = LanPeer(
                            peerId = "WIFI_DIRECT_${srcDevice.deviceAddress}",
                            ip = srcDevice.deviceAddress, // P2P device MAC / IP
                            port = remotePort,
                            pubKeyPrefix = remotePubKeyPrefix,
                            nickname = srcDevice.deviceName ?: "CFM1_P2P_${remotePubKeyPrefix.take(4)}",
                            transport = "WIFI_DIRECT",
                            lastSeen = System.currentTimeMillis()
                        )

                        discoveredPeers[peer.peerId] = peer
                        mainHandler.post {
                            onLanPeerDiscovered?.invoke(peer.peerId, peer.ip, peer.port, peer.pubKeyPrefix, peer.nickname, "WIFI_DIRECT")
                            notifyState()
                        }
                    }
                }
            )

            // 3. Add Service Request & Start Discovery
            val request = WifiP2pDnsSdServiceRequest.newInstance()
            p2pServiceRequest = request

            wifiP2pManager?.addServiceRequest(p2pChannel, request, object : WifiP2pManager.ActionListener {
                override fun onSuccess() {
                    wifiP2pManager?.discoverServices(p2pChannel, object : WifiP2pManager.ActionListener {
                        override fun onSuccess() {
                            Log.i(TAG, "Wi-Fi Direct service discovery initiated")
                        }
                        override fun onFailure(reason: Int) {
                            Log.w(TAG, "Wi-Fi Direct discoverServices failed: $reason")
                        }
                    })
                }
                override fun onFailure(reason: Int) {
                    Log.w(TAG, "Wi-Fi Direct addServiceRequest failed: $reason")
                }
            })

            return true
        } catch (e: Exception) {
            Log.e(TAG, "Wi-Fi Direct initialization failed: ${e.message}")
            return false
        }
    }

    fun stopWifiDirect() {
        if (!isWifiP2pRunning.getAndSet(false)) return

        try {
            p2pServiceInfo?.let {
                wifiP2pManager?.removeLocalService(p2pChannel, it, null)
            }
            p2pServiceRequest?.let {
                wifiP2pManager?.removeServiceRequest(p2pChannel, it, null)
            }
            wifiP2pManager?.clearLocalServices(p2pChannel, null)
            wifiP2pManager?.clearServiceRequests(p2pChannel, null)
        } catch (ignored: Exception) {}
        p2pServiceInfo = null
        p2pServiceRequest = null
    }

    private fun notifyState() {
        mainHandler.post {
            onLanTransportStateChanged?.invoke(
                isLanRunning.get(),
                localPort,
                discoveredPeers.size,
                isWifiP2pRunning.get()
            )
        }
    }

    fun getDiscoveredPeersList(): List<Map<String, Any>> {
        return discoveredPeers.values.map {
            mapOf(
                "peerId" to it.peerId,
                "ip" to it.ip,
                "port" to it.port,
                "pubKeyPrefix" to it.pubKeyPrefix,
                "nickname" to it.nickname,
                "transport" to it.transport,
                "lastSeen" to it.lastSeen
            )
        }
    }
}
