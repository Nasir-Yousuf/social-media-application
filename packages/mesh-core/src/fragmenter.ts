/**
 * Clearfeed Mesh (CFM1) BLE MTU Fragmentation & Reassembly Engine
 * Header (6B): FrameShortID (2B) | FragIdx (2B) | TotalFrags (2B)
 */

import {
  FRAGMENT_HEADER_SIZE,
  BLE_SAFE_MIN_CHUNK,
  MAX_FRAME_SIZE,
  DEFAULT_REASSEMBLY_TIMEOUT_MS,
} from './constants.js';
import { BLEFragment, BLEFragmentHeader } from './types.js';

/**
 * Calculates a deterministic 16-bit short ID from packet bytes or a counter
 */
export function computeFrameShortId(frameBytes: Uint8Array): number {
  if (frameBytes.length >= 24) {
    // Use lower 2 bytes of the 16-byte PacketID (offset 8..23)
    const view = new DataView(frameBytes.buffer, frameBytes.byteOffset + 8, 16);
    return view.getUint16(14, false);
  }
  // Fallback simple checksum
  let sum = 0;
  for (let i = 0; i < frameBytes.length; i++) {
    sum = (sum + frameBytes[i]) & 0xffff;
  }
  return sum;
}

/**
 * Splits a serialized CFM1 frame into chunks sized to (negotiatedMTU - 3).
 * Minimum fragment size is 20 bytes (6B header + 14B payload).
 */
export function fragmentFrame(
  serializedFrame: Uint8Array,
  negotiatedMTU = 247,
  customShortId?: number
): BLEFragment[] {
  if (serializedFrame.length > MAX_FRAME_SIZE) {
    throw new Error(`Frame size (${serializedFrame.length}) exceeds MAX_FRAME_SIZE (${MAX_FRAME_SIZE})`);
  }

  // BLE ATT header is 3 bytes (Opcode 1B + Handle 2B)
  const maxFragmentBytes = Math.max(BLE_SAFE_MIN_CHUNK, negotiatedMTU - 3);
  const maxPayloadPerChunk = maxFragmentBytes - FRAGMENT_HEADER_SIZE;
  if (maxPayloadPerChunk < 14) {
    throw new Error(`Negotiated MTU (${negotiatedMTU}) is too small to accommodate minimum fragment header`);
  }

  const frameShortId = customShortId !== undefined ? customShortId : computeFrameShortId(serializedFrame);
  const totalFrags = Math.ceil(serializedFrame.length / maxPayloadPerChunk);

  if (totalFrags > 0xffff) {
    throw new Error(`Total fragments (${totalFrags}) exceeds 16-bit integer capacity`);
  }

  const fragments: BLEFragment[] = [];

  for (let i = 0; i < totalFrags; i++) {
    const start = i * maxPayloadPerChunk;
    const end = Math.min(serializedFrame.length, start + maxPayloadPerChunk);
    const chunkData = serializedFrame.slice(start, end);

    const rawBytes = new Uint8Array(FRAGMENT_HEADER_SIZE + chunkData.length);
    const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);

    // FrameShortID (2B)
    view.setUint16(0, frameShortId, false);
    // FragIdx (2B)
    view.setUint16(2, i, false);
    // TotalFrags (2B)
    view.setUint16(4, totalFrags, false);
    // Chunk payload
    rawBytes.set(chunkData, FRAGMENT_HEADER_SIZE);

    const header: BLEFragmentHeader = {
      frameShortId,
      fragIdx: i,
      totalFrags,
    };

    fragments.push({
      header,
      data: chunkData,
      rawBytes,
    });
  }

  return fragments;
}

/**
 * Parses a single incoming raw fragment byte buffer
 */
export function parseFragment(rawBytes: Uint8Array): BLEFragment {
  if (rawBytes.length < FRAGMENT_HEADER_SIZE) {
    throw new Error(`Fragment buffer too small: expected >= 6 bytes, got ${rawBytes.length}`);
  }

  const view = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);
  const frameShortId = view.getUint16(0, false);
  const fragIdx = view.getUint16(2, false);
  const totalFrags = view.getUint16(4, false);

  if (totalFrags === 0) {
    throw new Error('Invalid totalFrags: cannot be 0');
  }
  if (fragIdx >= totalFrags) {
    throw new Error(`Invalid fragIdx (${fragIdx}) for totalFrags (${totalFrags})`);
  }

  const data = rawBytes.slice(FRAGMENT_HEADER_SIZE);

  return {
    header: { frameShortId, fragIdx, totalFrags },
    data,
    rawBytes,
  };
}

interface InFlightAssembly {
  frameShortId: number;
  totalFrags: number;
  chunks: Map<number, Uint8Array>;
  totalReceivedBytes: number;
  createdAt: number;
}

/**
 * Stateful out-of-order reassembly engine with 15s timeout and 64KB max protection
 */
export class BLEFrameReassembler {
  private inFlight: Map<number, InFlightAssembly> = new Map();
  private timeoutMs: number;

  constructor(timeoutMs = DEFAULT_REASSEMBLY_TIMEOUT_MS) {
    this.timeoutMs = timeoutMs;
  }

  /**
   * Process an incoming fragment buffer.
   * Returns reconstructed frame Uint8Array when all fragments are assembled, or null if pending.
   */
  public ingestFragment(rawFragment: Uint8Array, now = Date.now()): Uint8Array | null {
    this.pruneExpired(now);

    const fragment = parseFragment(rawFragment);
    const { frameShortId, fragIdx, totalFrags } = fragment.header;

    let assembly = this.inFlight.get(frameShortId);
    if (!assembly) {
      assembly = {
        frameShortId,
        totalFrags,
        chunks: new Map(),
        totalReceivedBytes: 0,
        createdAt: now,
      };
      this.inFlight.set(frameShortId, assembly);
    }

    // Verify consistency
    if (assembly.totalFrags !== totalFrags) {
      // Discard corrupt or conflicting shortId assembly
      this.inFlight.delete(frameShortId);
      throw new Error(`Conflicting totalFrags for shortId 0x${frameShortId.toString(16)}: ${assembly.totalFrags} vs ${totalFrags}`);
    }

    if (!assembly.chunks.has(fragIdx)) {
      assembly.chunks.set(fragIdx, fragment.data);
      assembly.totalReceivedBytes += fragment.data.length;

      // 64 KB protection
      if (assembly.totalReceivedBytes > MAX_FRAME_SIZE) {
        this.inFlight.delete(frameShortId);
        throw new Error(`Assembled frame exceeds 64 KB limit (${assembly.totalReceivedBytes} bytes)`);
      }
    }

    // Check completion
    if (assembly.chunks.size === totalFrags) {
      const fullFrame = new Uint8Array(assembly.totalReceivedBytes);
      let offset = 0;
      for (let i = 0; i < totalFrags; i++) {
        const chunk = assembly.chunks.get(i);
        if (!chunk) {
          // Missing piece unexpectedly
          return null;
        }
        fullFrame.set(chunk, offset);
        offset += chunk.length;
      }

      this.inFlight.delete(frameShortId);
      return fullFrame;
    }

    return null;
  }

  /**
   * Drops incomplete frames older than timeoutMs (default 15s)
   */
  public pruneExpired(now = Date.now()): number {
    let dropped = 0;
    for (const [shortId, assembly] of this.inFlight.entries()) {
      if (now - assembly.createdAt > this.timeoutMs) {
        this.inFlight.delete(shortId);
        dropped++;
      }
    }
    return dropped;
  }

  /**
   * Returns active assembly count
   */
  public getActiveAssemblyCount(): number {
    return this.inFlight.size;
  }
}
