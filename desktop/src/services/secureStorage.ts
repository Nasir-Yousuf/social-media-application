/**
 * Windows Credential Manager Bridge for Clearfeed Desktop (Tauri 2 + Rust)
 * 
 * Provides secure credential persistence via Windows Credential Manager API (keyring)
 * when running inside Tauri, and seamlessly falls back to localStorage when running in browser.
 */

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

async function getTauriInvoke() {
  if (!isTauri()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke;
  } catch {
    return null;
  }
}

export const secureStorage = {
  /**
   * Securely store user JWT authentication token
   */
  async storeToken(token: string): Promise<void> {
    try {
      localStorage.setItem('pulse518_token', token);
      const invoke = await getTauriInvoke();
      if (invoke) {
        await invoke('cmd_secure_store_token', { token });
      }
    } catch (err) {
      console.warn('[SecureStorage] Store token notice:', err);
    }
  },

  /**
   * Retrieve user JWT token from Windows Credential Manager or localStorage
   */
  async getToken(): Promise<string | null> {
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        const token = (await invoke('cmd_secure_get_token')) as string | null;
        if (token) {
          localStorage.setItem('pulse518_token', token);
          return token;
        }
      }
    } catch (err) {
      console.warn('[SecureStorage] Get token notice:', err);
    }
    return localStorage.getItem('pulse518_token');
  },

  /**
   * Delete user JWT token from Windows Credential Manager and localStorage
   */
  async deleteToken(): Promise<void> {
    try {
      localStorage.removeItem('pulse518_token');
      localStorage.removeItem('pulse518_user');
      const invoke = await getTauriInvoke();
      if (invoke) {
        await invoke('cmd_secure_delete_token');
      }
    } catch (err) {
      console.warn('[SecureStorage] Delete token notice:', err);
    }
  },

  /**
   * Securely store Clearfeed Mesh Ed25519 identity private key
   */
  async storeMeshIdentityKey(secretHex: string): Promise<void> {
    try {
      localStorage.setItem('clearfeed_mesh_secret_key', secretHex);
      const invoke = await getTauriInvoke();
      if (invoke) {
        await invoke('cmd_secure_store_mesh_key', { secretHex });
      }
    } catch (err) {
      console.warn('[SecureStorage] Store mesh key notice:', err);
    }
  },

  /**
   * Retrieve Clearfeed Mesh Ed25519 identity private key
   */
  async getMeshIdentityKey(): Promise<string | null> {
    try {
      const invoke = await getTauriInvoke();
      if (invoke) {
        const key = (await invoke('cmd_secure_get_mesh_key')) as string | null;
        if (key) {
          localStorage.setItem('clearfeed_mesh_secret_key', key);
          return key;
        }
      }
    } catch (err) {
      console.warn('[SecureStorage] Get mesh key notice:', err);
    }
    return localStorage.getItem('clearfeed_mesh_secret_key');
  },
};

export default secureStorage;
