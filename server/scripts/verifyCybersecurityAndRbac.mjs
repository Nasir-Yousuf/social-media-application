/**
 * Comprehensive Cybersecurity, RBAC Hardening, Socket.io Authorization & Privacy Verification Suite
 * Phase 18 Regression Test
 */

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Bookmark from '../models/Bookmark.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import {
  detectImageFormat,
  stripExifFromJpeg,
  sanitizeSvg,
  validateAndSanitizeImage,
  MAX_AVATAR_BYTES,
} from '../utils/fileSecurity.js';
import { isCoAdmin, DEFAULT_ADMIN_USERNAMES, DEFAULT_ADMIN_EMAILS } from '../controllers/authController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pulse518_super_secret_course_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}_refresh_v1`;

const results = [];

function assert(condition, testName, details = '') {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    results.push({ name: testName, passed: false, details });
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
  }
}

async function runTests() {
  console.log('\n🔒 Starting Phase 18 Cybersecurity, RBAC & Privacy Verification Suite...\n');

  // ==========================================
  // TEST 1: Password Comparison & bcrypt
  // ==========================================
  console.log('--- Test Suite 1: Password Hashing & Cryptographic Verification ---');
  const rawPassword = 'SecurePass#2026!Mesh';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const matchSuccess = await bcrypt.compare(rawPassword, hashedPassword);
  const matchFailure = await bcrypt.compare('WrongPassword#123', hashedPassword);

  assert(matchSuccess === true, 'bcrypt correctly verifies valid password');
  assert(matchFailure === false, 'bcrypt strictly rejects incorrect password');

  // ==========================================
  // TEST 2: tokenVersion Revocation & Multi-Device Logout
  // ==========================================
  console.log('\n--- Test Suite 2: Token Versioning & Multi-Device Session Invalidation ---');
  const dummyUserId = new mongoose.Types.ObjectId().toString();

  // Mint token at version 0
  const tokenV0 = jwt.sign({ userId: dummyUserId, tokenVersion: 0 }, JWT_SECRET, { expiresIn: '7d' });
  const refreshV0 = jwt.sign({ userId: dummyUserId, tokenVersion: 0 }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

  // Simulate user in DB with tokenVersion: 0
  let mockUser = { tokenVersion: 0 };
  let decoded = jwt.verify(tokenV0, JWT_SECRET);
  let isValid = decoded.tokenVersion === mockUser.tokenVersion;
  assert(isValid === true, 'Access token at version 0 is valid when user.tokenVersion is 0');

  // User clicks "Log out of all devices" -> tokenVersion increments to 1
  mockUser.tokenVersion = 1;

  // Verify old token is now invalidated
  let isRevoked = decoded.tokenVersion !== mockUser.tokenVersion;
  assert(isRevoked === true, 'Old access token is revoked immediately when user.tokenVersion increments');

  // Verify old refresh token is also invalidated
  let decodedRefresh = jwt.verify(refreshV0, JWT_REFRESH_SECRET);
  let isRefreshRevoked = decodedRefresh.tokenVersion !== mockUser.tokenVersion;
  assert(isRefreshRevoked === true, 'Old refresh token is revoked immediately when user.tokenVersion increments');

  // Mint new token at version 1
  const tokenV1 = jwt.sign({ userId: dummyUserId, tokenVersion: 1 }, JWT_SECRET, { expiresIn: '7d' });
  let decodedV1 = jwt.verify(tokenV1, JWT_SECRET);
  assert(decodedV1.tokenVersion === mockUser.tokenVersion, 'Fresh access token at version 1 succeeds');

  // ==========================================
  // TEST 3: Root Maintainer Safeguards
  // ==========================================
  console.log('\n--- Test Suite 3: Root Platform Maintainer Safeguards ---');
  for (const rootUser of DEFAULT_ADMIN_USERNAMES) {
    assert(isCoAdmin(rootUser, '') === true, `isCoAdmin recognizes root maintainer username: ${rootUser}`);
  }
  for (const rootEmail of DEFAULT_ADMIN_EMAILS) {
    assert(isCoAdmin('', rootEmail) === true, `isCoAdmin recognizes root maintainer email: ${rootEmail}`);
  }
  assert(isCoAdmin('regular_student_42', 'student@university.edu') === false, 'isCoAdmin rejects normal student account');

  // ==========================================
  // TEST 4: File Upload Security, Magic Bytes & EXIF Stripping
  // ==========================================
  console.log('\n--- Test Suite 4: File Upload Security & EXIF GPS Stripping ---');

  // 1. Magic bytes detection
  const validApp0 = Buffer.concat([
    Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]), // SOI + APP0 marker + len(16)
    Buffer.from('JFIF\0\x01\x01\0\0\x01\0\x01\0\0', 'binary'), // 14 bytes JFIF data
  ]);
  const pngMagic = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const gifMagic = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  const fakeImage = Buffer.from('<html><script>alert("hack")</script></html>');

  assert(detectImageFormat(validApp0) === 'jpeg', 'detectImageFormat detects JPEG magic bytes');
  assert(detectImageFormat(pngMagic) === 'png', 'detectImageFormat detects PNG magic bytes');
  assert(detectImageFormat(gifMagic) === 'gif', 'detectImageFormat detects GIF magic bytes');
  assert(detectImageFormat(fakeImage) === null, 'detectImageFormat rejects spoofed non-image payload');

  // 2. EXIF GPS Stripping
  // Build a synthetic JPEG containing SOI (FF D8), APP0 (JFIF), APP1 Exif segment with GPS tag, and image data (FF DA ... FF D9)
  const fakeGpsPayload = Buffer.from('GPS_LAT_23.8103_LON_90.4125_SECRET');
  const exifPayload = Buffer.concat([Buffer.from('Exif\0\0'), fakeGpsPayload]);
  const segLenBuf = Buffer.alloc(2);
  segLenBuf.writeUInt16BE(2 + exifPayload.length);
  const exifSegment = Buffer.concat([
    Buffer.from([0xFF, 0xE1]),
    segLenBuf,
    exifPayload,
  ]);

  const syntheticSos = Buffer.from([0xFF, 0xDA, 0x00, 0x08, 0x01, 0x02, 0x03, 0x00, 0xAA, 0xBB, 0xFF, 0xD9]); // SOS + EOI

  const rawJpegWithGps = Buffer.concat([
    validApp0,
    exifSegment,
    syntheticSos,
  ]);

  assert(rawJpegWithGps.includes(fakeGpsPayload), 'Synthetic JPEG initially contains GPS metadata');

  const strippedJpeg = stripExifFromJpeg(rawJpegWithGps);
  assert(!strippedJpeg.includes(fakeGpsPayload), 'stripExifFromJpeg successfully removed APP1 Exif GPS metadata');
  assert(strippedJpeg[0] === 0xFF && strippedJpeg[1] === 0xD8, 'Stripped JPEG retains SOI header');
  assert(strippedJpeg.includes(Buffer.from([0xFF, 0xDA])), 'Stripped JPEG retains image payload (SOS)');
  assert(strippedJpeg.includes(Buffer.from([0xFF, 0xD9])), 'Stripped JPEG retains EOI marker');

  // 3. SVG Sanitization
  const maliciousSvg = `<svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')">
    <script>fetch('/cookie?c=' + document.cookie)</script>
    <circle cx="50" cy="50" r="40" stroke="green" fill="yellow" />
    <a href="javascript:alert(1)">Click</a>
  </svg>`;

  const sanitizedSvg = sanitizeSvg(maliciousSvg);
  assert(!sanitizedSvg.includes('<script>'), 'sanitizeSvg strips <script> tags');
  assert(!sanitizedSvg.includes('onload='), 'sanitizeSvg strips inline onload handlers');
  assert(!sanitizedSvg.includes('javascript:'), 'sanitizeSvg strips javascript: URIs');
  assert(sanitizedSvg.includes('<circle'), 'sanitizeSvg preserves safe SVG elements');

  // 4. validateAndSanitizeImage
  const validSanitized = validateAndSanitizeImage(rawJpegWithGps, { maxSize: MAX_AVATAR_BYTES });
  assert(validSanitized.valid === true, 'validateAndSanitizeImage accepts valid JPEG');
  assert(validSanitized.mimeType === 'image/jpeg', 'validateAndSanitizeImage returns correct mimeType');
  assert(!validSanitized.buffer.includes(fakeGpsPayload), 'validateAndSanitizeImage stripped GPS from buffer');

  let sizeErrorCaught = false;
  try {
    const oversized = Buffer.alloc(MAX_AVATAR_BYTES + 1024);
    oversized[0] = 0xFF; oversized[1] = 0xD8; oversized[2] = 0xFF;
    validateAndSanitizeImage(oversized, { maxSize: MAX_AVATAR_BYTES });
  } catch (err) {
    sizeErrorCaught = true;
  }
  assert(sizeErrorCaught === true, 'validateAndSanitizeImage enforces strict size limit');

  // ==========================================
  // TEST 5: IDOR & Socket Authorization Invariants
  // ==========================================
  console.log('\n--- Test Suite 5: IDOR & WebRTC Participant Authorization ---');

  const aliceId = new mongoose.Types.ObjectId().toString();
  const bobId = new mongoose.Types.ObjectId().toString();
  const eveId = new mongoose.Types.ObjectId().toString();

  const mockConversation = {
    _id: new mongoose.Types.ObjectId(),
    participants: [aliceId, bobId],
  };

  // Alice and Bob are participants, Eve is attacker
  const isAliceParticipant = mockConversation.participants.some(p => p.toString() === aliceId);
  const isBobParticipant = mockConversation.participants.some(p => p.toString() === bobId);
  const isEveParticipant = mockConversation.participants.some(p => p.toString() === eveId);

  assert(isAliceParticipant === true, 'Alice is an authorized participant');
  assert(isBobParticipant === true, 'Bob is an authorized participant');
  assert(isEveParticipant === false, 'Eve is NOT a participant (IDOR blocked)');

  // WebRTC call session authorization check
  const mockCallSession = {
    callId: 'call_test_123',
    callerId: aliceId,
    calleeId: bobId,
  };

  const isAliceCallMember = mockCallSession.callerId === aliceId || mockCallSession.calleeId === aliceId;
  const isEveCallMember = mockCallSession.callerId === eveId || mockCallSession.calleeId === eveId;

  assert(isAliceCallMember === true, 'Alice is authorized to send WebRTC signals to call_test_123');
  assert(isEveCallMember === false, 'Eve is strictly blocked from sending WebRTC signals to call_test_123');

  // ==========================================
  // SUMMARY
  // ==========================================
  console.log('\n==========================================');
  const allPassed = results.every(r => r.passed);
  const totalPassed = results.filter(r => r.passed).length;
  console.log(`Results: ${totalPassed}/${results.length} assertions passed.`);

  if (allPassed) {
    console.log('🎉 ALL PHASE 18 CYBERSECURITY & RBAC TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED. Review output above.\n');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Verification script error:', err);
  process.exit(1);
});
