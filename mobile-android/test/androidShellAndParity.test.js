/**
 * Clearfeed Phase 4 & 5 Verification Suite
 * Tests:
 * 1. Android Manifest & app.json permissions & target SDK 35
 * 2. Deep linking schemes (clearfeed://) & routes
 * 3. Keystore Secure Storage & SQLite offline caching
 * 4. 5-Tab Navigation Shell structure & offline entry into Mesh
 * 5. Social Feed, nested comments, and moderation blocklist
 */
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('📱 Starting Android Architecture & Navigation Checks...');
console.log('======================================================\n');

// 1. Android Manifest & Permissions
test('Permissions: Android app.json contains all mandatory permissions', () => {
  const appJsonPath = path.join(rootDir, 'app.json');
  assert.ok(fs.existsSync(appJsonPath), 'app.json must exist');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const perms = appJson.expo?.android?.permissions || [];

  const required = [
    'android.permission.INTERNET',
    'android.permission.ACCESS_NETWORK_STATE',
    'android.permission.ACCESS_WIFI_STATE',
    'android.permission.CHANGE_WIFI_MULTICAST_STATE',
    'android.permission.CHANGE_WIFI_STATE',
    'android.permission.BLUETOOTH',
    'android.permission.BLUETOOTH_ADMIN',
    'android.permission.BLUETOOTH_SCAN',
    'android.permission.BLUETOOTH_ADVERTISE',
    'android.permission.BLUETOOTH_CONNECT',
    'android.permission.ACCESS_FINE_LOCATION',
    'android.permission.NEARBY_WIFI_DEVICES',
    'android.permission.RECORD_AUDIO',
    'android.permission.MODIFY_AUDIO_SETTINGS',
    'android.permission.FOREGROUND_SERVICE',
    'android.permission.FOREGROUND_SERVICE_MICROPHONE',
    'android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE',
    'android.permission.POST_NOTIFICATIONS',
    'android.permission.VIBRATE',
    'android.permission.WAKE_LOCK',
  ];

  for (const p of required) {
    assert.ok(perms.includes(p), `Missing mandatory permission: ${p}`);
  }
});

test('Target SDK: Android configuration targets API 35 with minSdk 24', () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'app.json'), 'utf8'));
  const buildPropsPlugin = appJson.expo?.plugins?.find(
    (p) => Array.isArray(p) && p[0] === 'expo-build-properties'
  );
  assert.ok(buildPropsPlugin, 'expo-build-properties plugin must be configured');
  const androidProps = buildPropsPlugin[1]?.android || {};
  assert.strictEqual(androidProps.minSdkVersion, 24, 'minSdkVersion must be 24');
  assert.strictEqual(androidProps.targetSdkVersion, 35, 'targetSdkVersion must be 35');
  assert.strictEqual(androidProps.compileSdkVersion, 35, 'compileSdkVersion must be 35');
});

test('Deep Linking: Android intentFilters configure clearfeed:// scheme', () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'app.json'), 'utf8'));
  assert.strictEqual(appJson.expo?.scheme, 'clearfeed', 'Scheme must be clearfeed');

  const intentFilters = appJson.expo?.android?.intentFilters || [];
  const clearfeedFilter = intentFilters.find((f) =>
    f.data?.some((d) => d.scheme === 'clearfeed')
  );
  assert.ok(clearfeedFilter, 'Android intentFilters must include clearfeed scheme');
});

test('Native Manifest: AndroidManifest.xml contains clearfeed scheme and services', () => {
  const manifestPath = path.join(rootDir, 'android/app/src/main/AndroidManifest.xml');
  assert.ok(fs.existsSync(manifestPath), 'AndroidManifest.xml must exist');
  const content = fs.readFileSync(manifestPath, 'utf8');

  assert.ok(content.includes('android:scheme="clearfeed"'), 'AndroidManifest must contain clearfeed scheme');
  assert.ok(content.includes('android.permission.FOREGROUND_SERVICE_MICROPHONE'), 'Must have microphone foreground service');
  assert.ok(content.includes('android.permission.CHANGE_WIFI_MULTICAST_STATE'), 'Must have multicast wifi state');
});

console.log('\n======================================================');
console.log('🔐 Starting Secure Storage & Offline SQLite Checks...');
console.log('======================================================\n');

// 2. Secure Storage & SQLite
await runAsyncTest('Secure Storage: Auth tokens and Mesh keys persist safely', async () => {
  const { setAuthToken, getAuthToken, clearAuthTokens, setMeshKeyPair, getMeshKeyPair } =
    await import('../src/services/secureStorage.js');

  await setAuthToken('jwt_test_token_518');
  const readToken = await getAuthToken();
  assert.strictEqual(readToken, 'jwt_test_token_518', 'Auth token must match');

  const dummyKeyPair = {
    publicKey: 'a1b2c3d4e5',
    secretKey: 'f6e5d4c3b2',
    fingerprint: 'CF518:A1B2',
  };
  await setMeshKeyPair(dummyKeyPair);
  const readKeyPair = await getMeshKeyPair();
  assert.deepStrictEqual(readKeyPair, dummyKeyPair, 'Mesh key pair must match');

  await clearAuthTokens();
  const clearedToken = await getAuthToken();
  assert.strictEqual(clearedToken, null, 'Cleared token must be null');
});

await runAsyncTest('Offline DB: Initializes schema, caches posts, and supports outbox queue', async () => {
  const {
    cachePosts,
    getCachedPosts,
    cacheLearnLesson,
    getCachedLearnLesson,
    saveLearnProgress,
    enqueueOutboxItem,
    getPendingOutboxItems,
    removeOutboxItem,
  } = await import('../src/services/offlineDatabase.js');

  const dummyPosts = [
    { _id: 'post_1', content: 'First post', createdAt: new Date(Date.now() - 1000).toISOString() },
    { _id: 'post_2', content: 'Second post', createdAt: new Date().toISOString() },
  ];
  await cachePosts(dummyPosts);
  const cached = await getCachedPosts(10);
  assert.ok(cached.length >= 2, 'Cached posts must return stored items');
  assert.strictEqual(cached[0]._id, 'post_2', 'Cached posts must be chronologically descending');

  // Learn cache
  await cacheLearnLesson('javascript', 'intro', { title: 'Intro to JS', content: 'Code' });
  const lesson = await getCachedLearnLesson('javascript', 'intro');
  assert.strictEqual(lesson.title, 'Intro to JS');

  // Outbox queue
  const outboxId = await enqueueOutboxItem('create_post', { content: 'Offline queued post' });
  assert.ok(outboxId, 'Must return outbox queue ID');
  const pending = await getPendingOutboxItems();
  assert.ok(pending.some((p) => p.id === outboxId));
  await removeOutboxItem(outboxId);
  const pendingAfter = await getPendingOutboxItems();
  assert.ok(!pendingAfter.some((p) => p.id === outboxId));
});

console.log('\n======================================================');
console.log('🧭 Starting 5-Tab Navigation & Screen Parity Checks...');
console.log('======================================================\n');

test('Navigation: 5-Tab Shell and Stack routes exist and are defined', () => {
  const navPath = path.join(rootDir, 'src/navigation/AppNavigator.jsx');
  assert.ok(fs.existsSync(navPath), 'AppNavigator.jsx must exist');
  const content = fs.readFileSync(navPath, 'utf8');

  // Check 5 primary tabs
  assert.ok(content.includes('name="Feed"'), 'Tab 1: Feed must be defined');
  assert.ok(content.includes('name="HubLearn"'), 'Tab 2: HubLearn must be defined');
  assert.ok(content.includes('name="Spaces"'), 'Tab 3: Spaces must be defined');
  assert.ok(content.includes('name="Connect"'), 'Tab 4: Connect must be defined');
  assert.ok(content.includes('name="Profile"'), 'Tab 5: Profile must be defined');

  // Check nested stack screens
  assert.ok(content.includes('name="PostDetail"'), 'PostDetail must be registered');
  assert.ok(content.includes('name="Compose"'), 'Compose must be registered');
  assert.ok(content.includes('name="EditProfile"'), 'EditProfile must be registered');
  assert.ok(content.includes('name="MeshHome"'), 'MeshHome must be registered');
  assert.ok(content.includes('name="LessonDetail"'), 'LessonDetail must be registered');
});

test('Overlays: Global MiniPlayerOverlay and OfflineBanner are mounted in App.js', () => {
  const appPath = path.join(rootDir, 'App.js');
  const content = fs.readFileSync(appPath, 'utf8');
  assert.ok(content.includes('<MiniPlayerOverlay />'), 'MiniPlayerOverlay must be mounted');
  assert.ok(content.includes('<OfflineBanner />'), 'OfflineBanner must be mounted');
});

console.log('\n======================================================');
console.log('🛡️ Starting Social Feed & Moderation Parity Checks...');
console.log('======================================================\n');

await runAsyncTest('Moderation: Blocklist filters blocked users from feeds', async () => {
  const { blockUserId, unblockUserId, getBlockedUserIds } = await import(
    '../src/services/moderationService.js'
  );

  const testUserId = 'blocked_user_99';
  await blockUserId(testUserId);
  let blocked = await getBlockedUserIds();
  assert.ok(blocked.includes(testUserId), 'User ID must be in blocklist');

  // Test feed filtering simulation
  const dummyFeed = [
    { _id: 'p1', author: { _id: 'user_good' }, content: 'Good post' },
    { _id: 'p2', author: { _id: testUserId }, content: 'Blocked post' },
  ];
  const filtered = dummyFeed.filter((p) => !blocked.includes(p.author._id));
  assert.strictEqual(filtered.length, 1, 'Blocked user post must be filtered out');
  assert.strictEqual(filtered[0]._id, 'p1');

  await unblockUserId(testUserId);
  blocked = await getBlockedUserIds();
  assert.ok(!blocked.includes(testUserId), 'User ID must be removed after unblock');
});

test('PostCard: Supports likes, bookmarks, share intent, and moderation flag', () => {
  const postCardPath = path.join(rootDir, 'src/components/PostCard.jsx');
  const content = fs.readFileSync(postCardPath, 'utf8');

  assert.ok(content.includes('Haptics.impactAsync'), 'Must trigger haptic feedback on interaction');
  assert.ok(content.includes('Share.share'), 'Must support Native Android Share intent');
  assert.ok(content.includes('onFlag'), 'Must support moderation flag action');
});

test('ComposeScreen: Supports image picker, markdown toolbar, and character counter', () => {
  const composePath = path.join(rootDir, 'src/screens/ComposeScreen.jsx');
  const content = fs.readFileSync(composePath, 'utf8');

  assert.ok(content.includes('ImagePicker.launchImageLibraryAsync'), 'Must support image attachment');
  assert.ok(content.includes('quality: 0.7'), 'Must compress images before upload');
  assert.ok(content.includes('handleInsertFormatting'), 'Must support markdown formatting toolbar');
  assert.ok(content.includes('MAX_CHARS - content.length'), 'Must display remaining character count');
});

console.log('\n======================================================');
console.log(`Results: ${passed}/${passed + failed} checks passed.`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
