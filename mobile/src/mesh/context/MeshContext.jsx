import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import meshStorage from '../storage/meshStorage.js';
import meshIdentityService from '../identity/meshIdentityService.js';
import meshTransport, { TransportState } from '../transport/meshTransport.js';
import meshRouter, { DeliveryState } from '../routing/meshRouter.js';

const MeshContext = createContext(null);

export const MeshProvider = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transportState, setTransportState] = useState(TransportState.INITIALIZING);
  const [peers, setPeers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [settings, setSettings] = useState({
    meshEnabled: true,
    relayEnabled: true,
    batterySaving: false,
  });

  // Initialize Mesh subsystem independently of online backend
  const refreshMeshState = useCallback(async () => {
    try {
      const id = await meshIdentityService.getOrCreateIdentity();
      setIdentity(id);

      const savedSettings = await meshStorage.loadSettings();
      setSettings(savedSettings);

      const savedPeers = await meshStorage.loadPeers();
      setPeers(savedPeers);

      const savedConvs = await meshStorage.loadConversations();
      setConversations(savedConvs);
    } catch (err) {
      console.warn('[MeshContext] Init warning:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    meshTransport.initialize();
    refreshMeshState();

    const unsubTransport = meshTransport.onStateChange((state) => {
      setTransportState(state);
    });

    const unsubMessages = meshRouter.onMessageReceived(() => {
      refreshMeshState();
    });

    const unsubDelivery = meshRouter.onDeliveryUpdated(() => {
      refreshMeshState();
    });

    const unsubPeers = meshRouter.onPeersUpdated(() => {
      refreshMeshState();
    });

    return () => {
      unsubTransport();
      unsubMessages();
      unsubDelivery();
      unsubPeers();
    };
  }, [refreshMeshState]);

  // Actions
  const updateNickname = async (newNickname) => {
    const updated = await meshIdentityService.updateNickname(newNickname);
    if (updated) setIdentity(updated);
    return updated;
  };

  const resetIdentity = async () => {
    const fresh = await meshIdentityService.resetIdentity();
    setIdentity(fresh);
    await refreshMeshState();
    return fresh;
  };

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await meshStorage.saveSettings(updated);
  };

  const verifyPeer = async (pubkey) => {
    const updatedPeers = peers.map((p) =>
      p.publicKeyHex.toLowerCase() === pubkey.toLowerCase()
        ? { ...p, status: 'verified' }
        : p
    );
    setPeers(updatedPeers);
    await meshStorage.savePeers(updatedPeers);
  };

  const blockPeer = async (pubkey) => {
    const updatedPeers = peers.map((p) =>
      p.publicKeyHex.toLowerCase() === pubkey.toLowerCase()
        ? { ...p, status: 'blocked' }
        : p
    );
    setPeers(updatedPeers);
    await meshStorage.savePeers(updatedPeers);
  };

  const addDiscoveredPeer = async (peer) => {
    const existing = peers.find(
      (p) => p.publicKeyHex.toLowerCase() === peer.publicKeyHex.toLowerCase()
    );
    let updated;
    if (existing) {
      updated = peers.map((p) =>
        p.publicKeyHex.toLowerCase() === peer.publicKeyHex.toLowerCase()
          ? { ...p, ...peer, lastSeen: Date.now() }
          : p
      );
    } else {
      updated = [
        ...peers,
        {
          ...peer,
          status: 'discovered',
          lastSeen: Date.now(),
        },
      ];
    }
    setPeers(updated);
    await meshStorage.savePeers(updated);
  };

  const sendMessage = async ({ recipientPubkey, recipientNickname, text }) => {
    const msg = await meshRouter.sendMessage({
      recipientPubkey,
      recipientNickname,
      text,
    });
    await refreshMeshState();
    return msg;
  };

  const loadMessages = async (recipientPubkey) => {
    return meshStorage.loadMessages(recipientPubkey.toLowerCase());
  };

  const addPeer = async (peer) => {
    await addDiscoveredPeer(peer);
    await meshRouter.sendAnnounce(peer.publicKeyHex);
    await refreshMeshState();
  };

  const broadcastBeacon = async () => {
    await meshRouter.broadcastBeacon();
    await refreshMeshState();
  };

  const clearAllData = async () => {
    await meshStorage.clearAllMeshStorage();
    await refreshMeshState();
  };

  return (
    <MeshContext.Provider
      value={{
        identity,
        loading,
        transportState,
        transportExplanation: meshTransport.getStateExplanation(),
        peers,
        conversations,
        settings,
        updateNickname,
        resetIdentity,
        updateSettings,
        verifyPeer,
        blockPeer,
        addDiscoveredPeer,
        addPeer,
        broadcastBeacon,
        sendMessage,
        loadMessages,
        clearAllData,
        refreshMeshState,
      }}
    >
      {children}
    </MeshContext.Provider>
  );
};

export const useMesh = () => {
  const context = useContext(MeshContext);
  if (!context) {
    throw new Error('useMesh must be used within a MeshProvider');
  }
  return context;
};

export default MeshContext;
