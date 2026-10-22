import meshStorage from '../storage/meshStorage.js';
import { generateIdentityKeypair, computeFingerprint } from '../crypto/meshCrypto.js';

class MeshIdentityService {
  constructor() {
    this.currentIdentity = null;
  }

  /**
   * Initializes or loads the persistent local Mesh identity
   */
  async getOrCreateIdentity(desiredNickname = null) {
    if (this.currentIdentity) {
      return this.currentIdentity;
    }

    const saved = await meshStorage.loadIdentity();
    if (saved && saved.publicKeyHex && saved.secretKeyHex) {
      this.currentIdentity = {
        ...saved,
        fingerprint: computeFingerprint(saved.publicKeyHex),
      };
      return this.currentIdentity;
    }

    // Generate fresh cryptographic identity
    const keypair = generateIdentityKeypair();
    const defaultNickname = desiredNickname?.trim()
      ? desiredNickname.trim()
      : `MeshNode-${keypair.publicKeyHex.slice(0, 4).toUpperCase()}`;

    const newIdentity = {
      publicKeyHex: keypair.publicKeyHex,
      secretKeyHex: keypair.secretKeyHex,
      nickname: defaultNickname,
      createdAt: Date.now(),
      fingerprint: computeFingerprint(keypair.publicKeyHex),
    };

    await meshStorage.saveIdentity(newIdentity);
    this.currentIdentity = newIdentity;
    return this.currentIdentity;
  }

  /**
   * Update local display nickname
   */
  async updateNickname(newNickname) {
    if (!this.currentIdentity) return null;
    const trimmed = newNickname.trim();
    if (!trimmed) return this.currentIdentity;

    this.currentIdentity = {
      ...this.currentIdentity,
      nickname: trimmed,
    };
    await meshStorage.saveIdentity(this.currentIdentity);
    return this.currentIdentity;
  }

  /**
   * Complete cryptographic identity reset
   */
  async resetIdentity() {
    this.currentIdentity = null;
    await meshStorage.clearIdentity();
    return this.getOrCreateIdentity();
  }

  /**
   * Get public identity object safe for broadcasting to peers
   */
  getPublicIdentity() {
    if (!this.currentIdentity) return null;
    return {
      publicKeyHex: this.currentIdentity.publicKeyHex,
      nickname: this.currentIdentity.nickname,
      fingerprint: this.currentIdentity.fingerprint,
    };
  }
}

export const meshIdentityService = new MeshIdentityService();
export default meshIdentityService;
