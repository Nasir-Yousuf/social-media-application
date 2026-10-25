import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import meshStorage, {
  MeshIdentity,
  MeshPeer,
  MeshConversation,
  MeshMessage,
  MeshSettings,
} from '../storage/meshStorage';
import { generateIdentityKeypair } from '../crypto/meshCrypto';
import meshTransport, { TransportState } from '../transport/meshTransport';
import meshRouter from '../routing/meshRouter';

interface MeshContextValue {
  identity: MeshIdentity | null;
  loading: boolean;
  transportState: TransportState;
  transportExplanation: string;
  peers: MeshPeer[];
  conversations: MeshConversation[];
  settings: MeshSettings;
  updateNickname: (newNickname: string) => Promise<MeshIdentity | null>;
  resetIdentity: () => Promise<MeshIdentity>;
  updateSettings: (newSettings: Partial<MeshSettings>) => Promise<void>;
  sendMessage: (args: { recipientPubkey: string; recipientNickname: string; text: string }) => Promise<MeshMessage>;
  loadMessages: (peerPubkey: string) => Promise<MeshMessage[]>;
  addPeer: (peer: MeshPeer) => Promise<void>;
  broadcastBeacon: () => Promise<void>;
  clearAllData: () => Promise<void>;
  refreshMeshState: () => Promise<void>;
}

const MeshContext = createContext<MeshContextValue | null>(null);

const getOrCreateIdentity = async (): Promise<MeshIdentity> => {
  let current = await meshStorage.loadIdentity();
  if (!current) {
    const keys = generateIdentityKeypair();
    current = {
      publicKeyHex: keys.publicKeyHex,
      secretKeyHex: keys.secretKeyHex,
      nickname: `Peer_${keys.publicKeyHex.substring(0, 6)}`,
      createdAt: Date.now(),
    };
    await meshStorage.saveIdentity(current);
  }
  return current;
};

export const MeshProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [identity, setIdentity] = useState<MeshIdentity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [transportState, setTransportState] = useState<TransportState>(TransportState.INITIALIZING);
  const [peers, setPeers] = useState<MeshPeer[]>([]);
  const [conversations, setConversations] = useState<MeshConversation[]>([]);
  const [settings, setSettings] = useState<MeshSettings>({
    meshEnabled: true,
    relayEnabled: true,
    batterySaving: false,
    discoveryIntervalSec: 10,
  });

  const refreshMeshState = useCallback(async () => {
    try {
      const id = await getOrCreateIdentity();
      setIdentity(id);

      const savedSettings = await meshStorage.loadSettings();
      setSettings(savedSettings);

      const savedPeers = await meshStorage.loadPeers();
      setPeers(savedPeers);

      const savedConvs = await meshStorage.loadConversations();
      setConversations(savedConvs);
    } catch (err: any) {
      console.warn('[MeshContext] Initialization notice:', err.message);
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

  const updateNickname = useCallback(async (newNickname: string): Promise<MeshIdentity | null> => {
    let current = identity;
    if (!current) {
      current = await meshStorage.loadIdentity();
    }
    if (!current) return null;
    const updated: MeshIdentity = { ...current, nickname: newNickname.trim() };
    await meshStorage.saveIdentity(updated);
    setIdentity(updated);
    return updated;
  }, [identity]);

  const resetIdentity = useCallback(async (): Promise<MeshIdentity> => {
    await meshStorage.clearIdentity();
    const fresh = await getOrCreateIdentity();
    setIdentity(fresh);
    await refreshMeshState();
    return fresh;
  }, [refreshMeshState]);

  const updateSettings = useCallback(async (newSettings: Partial<MeshSettings>): Promise<void> => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      meshStorage.saveSettings(updated);
      return updated;
    });
  }, []);

  const sendMessage = useCallback(async ({
    recipientPubkey,
    recipientNickname,
    text,
  }: {
    recipientPubkey: string;
    recipientNickname: string;
    text: string;
  }): Promise<MeshMessage> => {
    const msg = await meshRouter.sendMessage({ recipientPubkey, recipientNickname, text });
    await refreshMeshState();
    return msg;
  }, [refreshMeshState]);

  const loadMessages = useCallback(async (peerPubkey: string): Promise<MeshMessage[]> => {
    return meshStorage.loadMessages(peerPubkey);
  }, []);

  const addPeer = useCallback(async (peer: MeshPeer): Promise<void> => {
    await meshStorage.upsertPeer(peer);
    // Announce presence immediately to this peer
    await meshRouter.sendAnnounce(peer.publicKeyHex);
    await refreshMeshState();
  }, [refreshMeshState]);

  const broadcastBeacon = useCallback(async (): Promise<void> => {
    await meshRouter.broadcastBeacon();
    await refreshMeshState();
  }, [refreshMeshState]);

  const clearAllData = useCallback(async (): Promise<void> => {
    await meshStorage.clearAllMeshStorage();
    await refreshMeshState();
  }, [refreshMeshState]);

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
        sendMessage,
        loadMessages,
        addPeer,
        broadcastBeacon,
        clearAllData,
        refreshMeshState,
      }}
    >
      {children}
    </MeshContext.Provider>
  );
};

export const useMesh = (): MeshContextValue => {
  const context = useContext(MeshContext);
  if (!context) {
    throw new Error('useMesh must be used within a MeshProvider');
  }
  return context;
};

export default MeshContext;
