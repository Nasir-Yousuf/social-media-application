/**
 * Clearfeed Mesh (CFM1) 256-Byte Bloom Filter & Epidemic Sync Summary
 * Specification: Version 1.0 (CFM1)
 * 
 * Used in 0x06=SYNC_SUMMARY packets during peer encounter to discover missing
 * packets in bounded store-and-forward queues with minimal bandwidth overhead.
 */

export const BLOOM_FILTER_BYTES = 256; // 2048 bits
export const BLOOM_FILTER_BITS = BLOOM_FILTER_BYTES * 8; // 2048 bits
export const BLOOM_HASH_FUNCTIONS = 4;

function fnv1a32(data: Uint8Array, seed = 0x811c9dc5): number {
  let hash = seed;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function murmur3_32(data: Uint8Array, seed = 0): number {
  let h = seed >>> 0;
  const len = data.length;
  const nblocks = Math.floor(len / 4);

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  for (let i = 0; i < nblocks; i++) {
    let k = view.getUint32(i * 4, true);
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);

    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = Math.imul(h, 5) + 0xe6546b64;
  }

  let k1 = 0;
  const tail = len % 4;
  const tailOffset = nblocks * 4;
  if (tail === 3) k1 ^= data[tailOffset + 2] << 16;
  if (tail >= 2) k1 ^= data[tailOffset + 1] << 8;
  if (tail >= 1) {
    k1 ^= data[tailOffset];
    k1 = Math.imul(k1, 0xcc9e2d51);
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = Math.imul(k1, 0x1b873593);
    h ^= k1;
  }

  h ^= len;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;

  return h >>> 0;
}

function normalizePacketId(id: Uint8Array | string): Uint8Array {
  if (typeof id === 'string') {
    const clean = id.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length === 32) {
      const bytes = new Uint8Array(16);
      for (let i = 0; i < 16; i++) {
        bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
      }
      return bytes;
    }
    return new TextEncoder().encode(id);
  }
  return id;
}

export class BloomFilter {
  private readonly bitset: Uint8Array;

  constructor(existingBytes?: Uint8Array) {
    if (existingBytes) {
      if (existingBytes.length !== BLOOM_FILTER_BYTES) {
        throw new Error(
          `Bloom filter byte length must be ${BLOOM_FILTER_BYTES}, got ${existingBytes.length}`
        );
      }
      this.bitset = new Uint8Array(existingBytes);
    } else {
      this.bitset = new Uint8Array(BLOOM_FILTER_BYTES);
    }
  }

  /**
   * Adds a packetId (16 bytes) into the Bloom filter bitset
   */
  public add(packetId: Uint8Array | string): void {
    const bytes = normalizePacketId(packetId);
    const h1 = fnv1a32(bytes);
    const h2 = murmur3_32(bytes);

    for (let i = 0; i < BLOOM_HASH_FUNCTIONS; i++) {
      const combined = (h1 + Math.imul(i, h2)) >>> 0;
      const bitIdx = combined % BLOOM_FILTER_BITS;
      const byteIdx = Math.floor(bitIdx / 8);
      const bitMask = 1 << (bitIdx % 8);
      this.bitset[byteIdx] |= bitMask;
    }
  }

  /**
   * Tests whether a packetId is likely in the Bloom filter
   * Returns false if definitely not present (0 false negatives)
   */
  public has(packetId: Uint8Array | string): boolean {
    const bytes = normalizePacketId(packetId);
    const h1 = fnv1a32(bytes);
    const h2 = murmur3_32(bytes);

    for (let i = 0; i < BLOOM_HASH_FUNCTIONS; i++) {
      const combined = (h1 + Math.imul(i, h2)) >>> 0;
      const bitIdx = combined % BLOOM_FILTER_BITS;
      const byteIdx = Math.floor(bitIdx / 8);
      const bitMask = 1 << (bitIdx % 8);
      if ((this.bitset[byteIdx] & bitMask) === 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns copy of the 256-byte bitset
   */
  public toByteArray(): Uint8Array {
    return new Uint8Array(this.bitset);
  }

  /**
   * Returns hex string of the 256-byte bitset (512 hex characters)
   */
  public toHex(): string {
    let hex = '';
    for (let i = 0; i < this.bitset.length; i++) {
      hex += this.bitset[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  /**
   * Count number of set bits (for saturation diagnostics)
   */
  public countSetBits(): number {
    let count = 0;
    for (let i = 0; i < this.bitset.length; i++) {
      let b = this.bitset[i];
      while (b > 0) {
        count += b & 1;
        b >>= 1;
      }
    }
    return count;
  }

  public static fromByteArray(bytes: Uint8Array): BloomFilter {
    return new BloomFilter(bytes);
  }

  public static fromHex(hex: string): BloomFilter {
    const bytes = new Uint8Array(BLOOM_FILTER_BYTES);
    if (typeof hex === 'string') {
      const clean = hex.replace(/[^0-9a-fA-F]/g, '');
      const limit = Math.min(BLOOM_FILTER_BYTES, Math.floor(clean.length / 2));
      for (let i = 0; i < limit; i++) {
        bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16) || 0;
      }
    }
    return new BloomFilter(bytes);
  }
}
