# Clearfeed Mesh
## Simple User Guide | English & বাংলা

**Tagline:** Connect nearby. Communicate offline.  
**বাংলা:** কাছাকাছি সংযুক্ত হোন। ইন্টারনেট ছাড়াই যোগাযোগ করুন।

---

# PART 1: ENGLISH DOCUMENTATION

## 1. What is Clearfeed Mesh?

Clearfeed Mesh is an offline messaging feature designed to let people communicate directly with nearby devices without mobile data, Wi-Fi internet, or a central server.

Normally, messaging apps use the internet to send your messages through their servers. Clearfeed Mesh is designed to work differently.

It uses nearby devices as communication points. A message can travel directly to its recipient or pass through other Clearfeed Mesh users' devices until it reaches the recipient.

**Example:** Imagine you are in a hostel where the internet is unavailable. You and your friends have Clearfeed Mesh installed. If your devices can connect directly or through other participating devices, you can exchange messages without internet access.

## 2. How does Mesh Messaging work?

Think of Clearfeed Mesh like a chain of people passing a sealed envelope.

```text
Alice → Bob → Charlie → David
```

- Alice writes a message for David.
- Alice's device encrypts the message so that only David can read it.
- Bob's device receives the encrypted message and forwards it.
- Charlie's device forwards it again.
- David's device receives and decrypts the message.

Bob and Charlie help deliver the message, but they should not be able to read its contents.

```text
Alice 📱  →  Bob 📱  →  Charlie 📱  →  David 📱
  Sender       Relay          Relay          Recipient
```

This is called **multi-hop messaging**. Each device that forwards a message is called a *relay node*.

If Alice can reach David directly, the message does not need to pass through Bob or Charlie.

### What makes this possible?

Clearfeed Mesh is designed around these components:

- **Nearby discovery:** Devices search for other compatible Clearfeed Mesh devices.
- **Wireless communication:** Supported devices communicate using available local wireless technologies, such as Bluetooth Low Energy.
- **Encryption:** The message is encrypted before it is forwarded.
- **Relaying:** Participating devices forward encrypted messages toward their destinations.
- **Message tracking:** The app reports whether a message is queued, forwarded, or acknowledged by the recipient.

The actual wireless technologies available depend on the device, operating system, and implementation.

## 3. Do I need internet or an account?

The intended Clearfeed Mesh design supports account-free, offline use.

| Feature | Internet required? |
|---|---|
| Open Mesh and create a local identity | No |
| Discover nearby compatible devices | No |
| Send a direct message to a reachable device | No |
| Relay messages through nearby devices | No, if a working relay route exists |
| Use Clearfeed's online timeline and cloud messaging | Yes |
| Automatically back up Mesh conversations to the cloud | Not part of the intended design |

**Important:** Offline messaging does not mean you can contact anyone anywhere in the world. Your recipient must be reachable through a compatible wireless connection or a chain of participating devices.

## 4. How can I start using Clearfeed Mesh?

Follow these steps when the feature is available in your installed version.

### Step 1: Install and open Clearfeed

Install a compatible version of Clearfeed on your device.

Open the app and select **Open Mesh Chat (Offline)** or **Mesh Chat**, depending on the version.

The intended design allows you to enter Mesh without signing in to a Clearfeed online account.

### Step 2: Create your local identity

Choose a nickname, such as `Alice`, `Rahim`, or `Student 01`.

Clearfeed Mesh creates a local cryptographic identity for your device. This identity is separate from your normal Clearfeed account.

Keep in mind that a nickname is not proof of someone's real-world identity.

### Step 3: Enable the required permissions

Depending on your device and operating system, you may need to enable:

- Bluetooth.
- Nearby-device or Bluetooth permissions.
- Local network access, if the app uses it.
- Other permissions required by the supported wireless transport.

You do not need to connect to the internet just to exchange local Mesh messages.

### Step 4: Discover nearby users (Radar & QR Code)

Clearfeed Mesh provides two ultra-fast, 100% offline ways to connect:

1. **Auto-Discovery Radar:** Open the **Nearby Peers** tab. Compatible devices within range on local wireless/Wi-Fi will appear automatically with a green online indicator. Tap **Message Directly** to start chatting immediately.
2. **Instant QR Code Scan & Connect:** Tap **Scan & Connect Nearby** (or the QR icon). Show your QR code to a friend, or point your camera/webcam at their screen. Pairing happens in under 1 second without typing any 64-character keys!

If no devices appear automatically, tap **Ping Nearby** to broadcast an immediate presence beacon, or verify local Wi-Fi / Bluetooth is active on both devices.

### Step 5: Verify the recipient (Safety Fingerprint)

For better security, compare the person's safety fingerprint with them in person or through another trusted method.

A fingerprint is a short representation of a cryptographic identity. Matching fingerprints help you confirm that you are communicating with the intended device identity.

Do not assume a nickname alone proves who someone is.

### Step 6: Send a message

Open the conversation, type your message, and tap **Send**.

Your message may be:

- Delivered directly to the recipient.
- Forwarded by one or more participating devices.
- Saved locally and queued until a suitable route becomes available.

The app should show the actual delivery status rather than claiming success too early.

## 5. How can a message reach someone far away?

Suppose Alice and David cannot connect directly, but Bob and Charlie are between them.

```text
Alice → Bob → Charlie → David
```

For this to work:

1. Alice's device must be able to reach Bob.
2. Bob's device must be able to reach Charlie.
3. Charlie's device must be able to reach David.
4. The participating devices must support compatible forwarding.
5. The message must still be valid and within its forwarding limits.

If Bob disables relay participation, Bob may still be able to send and receive direct messages, but his device will not forward messages for others.

**Remember:** More relay devices can extend the possible communication range, but every additional hop depends on real wireless connectivity. Mesh is not unlimited-range communication.

## 6. What do the message statuses mean?

| Status | Meaning |
|---|---|
| **Saved Locally** | The message has been saved on your device. |
| **Queued for Route** | The message is waiting for a suitable connection or route. |
| **Sent to Neighbor** | Your device transmitted the message to a nearby device. |
| **Relayed** | The message was forwarded through one or more intermediate devices. |
| **Acknowledged** | The recipient's device verified the message and returned a valid receipt. |
| **Failed / Expired** | The message could not be delivered within its allowed limits or time. |

**Important:** “Sent to Neighbor” does not mean the recipient has received the message. “Acknowledged” is the stronger confirmation.

## 7. Is Clearfeed Mesh secure?

Clearfeed Mesh is designed to use end-to-end encryption.

This means the sender encrypts a message, and the intended recipient decrypts it. Intermediate relay devices should only forward the encrypted data.

The documented design uses modern cryptographic components:

- **Ed25519:** Digital signatures and identity verification.
- **X25519:** Establishing shared cryptographic secrets.
- **ChaCha20-Poly1305:** Encrypting messages and checking their integrity.
- **Safety fingerprints:** Helping users verify the identity of a device.

These are components of the intended design, not a guarantee that every implementation is secure. Real security depends on correct key management, implementation, testing, and independent review.

### Good security habits

- Verify fingerprints when communicating with someone important.
- Keep your device and app updated.
- Do not share private keys or sensitive security information.
- Remember that nearby people may still see device presence or other network metadata.
- Use a device lock to protect locally stored conversations.

## 8. What happens to my messages and privacy?

The intended design keeps Mesh conversations and private keys on users' devices rather than automatically uploading them to Clearfeed's online server.

A relay device may temporarily store encrypted packets so they can be forwarded later. Expired packets should be removed according to the protocol's limits.

However, local storage is not automatically safe from someone who gains access to your unlocked device.

Also, encryption protects message contents; it does not necessarily hide all information about who is nearby, when devices communicate, or how much data they exchange.

**Mesh messages are designed to remain separate from online Clearfeed messaging.** Do not assume Mesh conversations will appear on your other devices or be backed up online.

## 9. What if nobody is nearby?

If the recipient cannot be reached:

1. The message may be queued locally.
2. Your device can look for a suitable route while the message remains valid.
3. If a compatible device or relay route becomes available, the message may be forwarded.
4. If the message expires or cannot be delivered, the app should show that result.

Queued messages are not guaranteed to arrive. Keep Clearfeed Mesh available as required by your device's operating system, and check the message status later.

## 10. Common problems and solutions

**Problem: I cannot see any nearby users.**

- Make sure the other person has a compatible version of Clearfeed Mesh.
- Check Bluetooth and nearby-device permissions.
- Make sure both devices are within wireless range.
- Keep the app open while testing.
- Confirm that the transport is supported on both devices.

**Problem: My message says “Queued for Route.”**

There may be no usable connection or relay path. Move closer to the recipient or to a participating device, and wait for a route to become available.

**Problem: My message says “Sent to Neighbor,” but my friend has not received it.**

The neighboring device may not have reached your friend. Check for further relay progress or a recipient acknowledgement.

**Problem: Messages stop when the app is in the background.**

Some operating systems limit background Bluetooth activity. Check the app's permissions and battery restrictions. The app may need to remain open for reliable testing.

**Problem: My friend uses another phone or a desktop computer.**

Cross-platform communication works only when both versions implement a compatible protocol and compatible wireless transports. A desktop interface alone does not guarantee desktop-to-phone offline connectivity.

## 11. What is included in the first version?

The documented v1 design focuses on:

- Local identity and nearby-device discovery.
- End-to-end encrypted text messaging.
- Direct and multi-hop message forwarding.
- Message deduplication and forwarding limits.
- Local message queues and delivery acknowledgements.
- Controls for participating in relaying.
- Separate Mesh settings and conversation history.

Features such as photos, file sharing, live voice calls, and reliable desktop-to-mobile offline communication require additional implementation and testing. Do not assume they are available unless they are explicitly supported in your installed version.

## 12. Final things to remember

- Mesh works without internet, but it still needs a working local wireless path.
- More participating devices can help messages travel farther.
- Relay devices should not be able to read end-to-end encrypted message contents.
- A message sent to a nearby device is not necessarily delivered to its recipient.
- Queued messages can fail or expire.
- Device and operating-system restrictions can affect reliability.
- Mesh and online Clearfeed messaging are separate in the intended design.

---

# PART 2: বাংলা ডকুমেন্টেশন

## ১. Clearfeed Mesh কী?

Clearfeed Mesh হলো Clearfeed-এর একটি অফলাইন মেসেজিং ব্যবস্থা, যার মাধ্যমে কাছাকাছি থাকা ডিভাইসগুলোর মধ্যে ইন্টারনেট বা মোবাইল ডাটা ছাড়াই বার্তা আদান-প্রদান করার পরিকল্পনা করা হয়েছে।

সাধারণত WhatsApp বা Messenger-এর মতো অ্যাপ ইন্টারনেটের মাধ্যমে সার্ভারে মেসেজ পাঠায়। কিন্তু Clearfeed Mesh-এর ধারণা আলাদা।

এখানে কাছাকাছি থাকা ডিভাইসগুলো নিজেদের মধ্যে যোগাযোগ করে। প্রয়োজন হলে অন্য ব্যবহারকারীর ডিভাইসের মাধ্যমে একটি মেসেজ তার গন্তব্যে পৌঁছাতে পারে।

**উদাহরণ:** আপনি একটি হোস্টেলে আছেন, কিন্তু সেখানে ইন্টারনেট নেই। আপনার এবং আপনার বন্ধুদের ফোনে Clearfeed Mesh চালু আছে। আপনাদের ডিভাইস সরাসরি অথবা মাঝখানে অন্য ব্যবহারকারীর ডিভাইসের মাধ্যমে সংযুক্ত হতে পারলে আপনারা মেসেজ আদান-প্রদান করতে পারবেন।

## ২. Mesh Messaging কীভাবে কাজ করে?

ধরুন, Alice তার বন্ধু David-কে একটি মেসেজ পাঠাতে চায়। কিন্তু David-এর ফোন Alice-এর ফোনের সরাসরি যোগাযোগের সীমার বাইরে।

মাঝখানে Bob এবং Charlie আছে।

```text
Alice → Bob → Charlie → David
```

এখন ধাপে ধাপে দেখি:

১. Alice তার ফোনে David-এর জন্য একটি মেসেজ লেখে।

২. Alice-এর ফোন মেসেজটি এনক্রিপ্ট করে, যাতে নির্দিষ্ট প্রাপক ছাড়া অন্য কেউ মেসেজের বিষয়বস্তু পড়তে না পারে।

৩. Bob-এর ফোন এনক্রিপ্ট করা মেসেজটি গ্রহণ করে এবং সামনে পাঠায়।

৪. Charlie-এর ফোন মেসেজটি আবার সামনে পাঠায়।

৫. David-এর ফোন মেসেজটি গ্রহণ করে এবং ডিক্রিপ্ট করে পড়তে পারে।

Bob এবং Charlie মেসেজ পৌঁছাতে সাহায্য করে, কিন্তু তাদের মেসেজের ভেতরের লেখা পড়তে পারার কথা নয়।

এভাবে একাধিক ডিভাইসের মাধ্যমে মেসেজ পাঠানোর পদ্ধতিকে **Multi-hop Messaging** বলে।

যে ডিভাইস অন্যের মেসেজ সামনে পাঠায়, তাকে **Relay Node** বলা হয়।

### এই ব্যবস্থা কীভাবে কাজ করবে?

- **Device Discovery:** কাছাকাছি থাকা Clearfeed Mesh ডিভাইস খুঁজে বের করা।
- **Wireless Connection:** Bluetooth Low Energy-এর মতো সমর্থিত স্থানীয় ওয়্যারলেস প্রযুক্তি ব্যবহার করা।
- **Encryption:** মেসেজ পাঠানোর আগে সেটিকে এনক্রিপ্ট করা।
- **Relay:** মাঝখানের ডিভাইসের মাধ্যমে মেসেজ সামনে পাঠানো।
- **Delivery Status:** মেসেজ কোথায় আছে এবং প্রাপক সেটি পেয়েছে কি না, তা দেখানো।

কোন ডিভাইসে কোন ওয়্যারলেস প্রযুক্তি কাজ করবে, তা অ্যাপের বাস্তবায়ন, ডিভাইস এবং অপারেটিং সিস্টেমের ওপর নির্ভর করবে।

## ৩. Clearfeed Mesh ব্যবহার করতে কি ইন্টারনেট বা অ্যাকাউন্ট লাগবে?

Clearfeed Mesh-এর পরিকল্পিত ব্যবস্থায় অ্যাকাউন্ট ছাড়াই অফলাইনে যোগাযোগ করা যাবে।

| কাজ | ইন্টারনেট লাগবে? |
|---|---|
| Mesh চালু করে স্থানীয় পরিচয় তৈরি করা | না |
| কাছাকাছি থাকা সামঞ্জস্যপূর্ণ ডিভাইস খোঁজা | না |
| সরাসরি যোগাযোগ করা যায় এমন ডিভাইসে মেসেজ পাঠানো | না |
| অন্য ডিভাইসের মাধ্যমে মেসেজ পাঠানো | না, যদি কার্যকর Relay পথ থাকে |
| Clearfeed-এর অনলাইন মেসেজিং ও Timeline ব্যবহার করা | হ্যাঁ |
| Mesh মেসেজ স্বয়ংক্রিয়ভাবে ক্লাউডে ব্যাকআপ করা | পরিকল্পিত ব্যবস্থার অংশ নয় |

**মনে রাখবেন:** ইন্টারনেট ছাড়া মেসেজ পাঠানো সম্ভব হলেও পৃথিবীর যেকোনো জায়গায় থাকা কাউকে সরাসরি মেসেজ পাঠানো যাবে না। প্রাপকের কাছে পৌঁছানোর মতো ওয়্যারলেস সংযোগ অথবা Relay ডিভাইসের একটি কার্যকর পথ থাকতে হবে।

## ৪. কীভাবে Clearfeed Mesh ব্যবহার শুরু করবেন?

আপনার অ্যাপের সংস্করণে ফিচারটি চালু থাকলে নিচের ধাপগুলো অনুসরণ করুন।

### ধাপ ১: Clearfeed ইনস্টল করুন

আপনার ডিভাইসে Clearfeed-এর সামঞ্জস্যপূর্ণ সংস্করণ ইনস্টল করুন।

অ্যাপ খুলে **Open Mesh Chat (Offline)** অথবা **Mesh Chat** অপশন নির্বাচন করুন।

পরিকল্পিত ব্যবস্থায় অনলাইন অ্যাকাউন্টে লগইন না করেও Mesh ব্যবহার করা যাবে।

### ধাপ ২: নিজের স্থানীয় পরিচয় তৈরি করুন

একটি Nickname নির্বাচন করুন। যেমন:

- Alice
- Rahim
- Student 01

Clearfeed Mesh আপনার ডিভাইসের জন্য একটি স্থানীয় ক্রিপ্টোগ্রাফিক পরিচয় তৈরি করবে। এটি আপনার সাধারণ Clearfeed অ্যাকাউন্ট থেকে আলাদা।

মনে রাখবেন, শুধু Nickname দেখেই কারও প্রকৃত পরিচয় নিশ্চিত হওয়া যায় না।

### ধাপ ৩: প্রয়োজনীয় Permission চালু করুন

আপনার ফোন এবং অপারেটিং সিস্টেম অনুযায়ী নিচের Permission-গুলো প্রয়োজন হতে পারে:

- Bluetooth
- Nearby Devices
- Bluetooth বা Local Network Access
- অ্যাপের ব্যবহৃত ওয়্যারলেস প্রযুক্তির জন্য প্রয়োজনীয় অন্যান্য Permission

শুধু স্থানীয় Mesh মেসেজ আদান-প্রদানের জন্য ইন্টারনেট সংযোগ প্রয়োজন হওয়ার কথা নয়।

### ধাপ ৪: কাছাকাছি ব্যবহারকারীদের খুঁজুন (রেডার ও কিউআর কোড)

Clearfeed Mesh-এ ১০০% অফলাইনে অতিদ্রুত সংযুক্ত হওয়ার ২টি সহজ পদ্ধতি রয়েছে:

১. **অটো-ডিসকভারি রেডার (Nearby Radar):** অ্যাপের **Peers** ট্যাবে যান। স্থানীয় ওয়াইফাই বা রেডিও তরঙ্গে থাকা ডিভাইসগুলো স্বয়ংক্রিয়ভাবে অনলাইন হিসেবে ভেসে উঠবে। সরাসরি **Message** বোতামে ক্লিক করেই চ্যাট শুরু করতে পারেন।  
২. **তাত্ক্ষণিক কিউআর কোড স্ক্যান (Scan & Connect):** **Scan & Connect Nearby** (বা QR আইকন)-এ ট্যাপ করুন। আপনার কিউআর কোডটি বন্ধুর ফোনে দেখান, অথবা আপনার ক্যামেরা দিয়ে বন্ধুর কিউআর কোডটি স্ক্যান করুন। কোনো দীর্ঘ ৬৪-অক্ষরের কি টাইপ করা ছাড়াই ১ সেকেন্ডের মধ্যে এনক্রিপ্ট সংযোগ তৈরি হবে!

কাউকে দেখতে না পেলে **Ping Nearby** চেপে একটি তাত্ক্ষণিক সিগন্যাল পাঠাতে পারেন।

### ধাপ ৫: প্রাপকের পরিচয় যাচাই করুন (Safety Fingerprint)

গুরুত্বপূর্ণ বা ব্যক্তিগত কথোপকথনের আগে Safety Fingerprint যাচাই করা ভালো।

Fingerprint হলো একটি ক্রিপ্টোগ্রাফিক পরিচয়ের সংক্ষিপ্ত রূপ। সামনাসামনি অথবা অন্য কোনো বিশ্বস্ত মাধ্যমে দুই পক্ষের Fingerprint মিলিয়ে দেখা যায়।

শুধু Nickname দেখে কাউকে নিশ্চিতভাবে শনাক্ত করবেন না।

### ধাপ ৬: মেসেজ পাঠান

কথোপকথন খুলুন, মেসেজ লিখুন এবং **Send** চাপুন।

আপনার মেসেজ:

- সরাসরি প্রাপকের কাছে পৌঁছাতে পারে।
- এক বা একাধিক Relay ডিভাইসের মাধ্যমে যেতে পারে।
- উপযুক্ত সংযোগ না পাওয়া পর্যন্ত ফোনে Queue হয়ে থাকতে পারে।

অ্যাপের উচিত মেসেজের প্রকৃত অবস্থা দেখানো, নিশ্চিত না হয়েই Delivered দেখানো নয়।

## ৫. অন্য ব্যবহারকারীর মাধ্যমে মেসেজ কীভাবে পৌঁছায়?

ধরুন, Alice এবং David সরাসরি সংযুক্ত হতে পারছে না। কিন্তু মাঝখানে Bob এবং Charlie আছে।

```text
Alice → Bob → Charlie → David
```

এই পদ্ধতিতে মেসেজ পৌঁছানোর জন্য:

১. Alice-এর ফোন থেকে Bob-এর ফোনে সংযোগ থাকতে হবে।

২. Bob-এর ফোন থেকে Charlie-এর ফোনে সংযোগ থাকতে হবে।

৩. Charlie-এর ফোন থেকে David-এর ফোনে সংযোগ থাকতে হবে।

৪. মাঝখানের ডিভাইসগুলোতে Relay করার সুবিধা থাকতে হবে এবং সেটি চালু থাকতে হবে।

৫. মেসেজটির মেয়াদ ও Forwarding সীমা শেষ হয়ে যাওয়া যাবে না।

Bob যদি Relay বন্ধ করে দেয়, তাহলে সে সরাসরি মেসেজ পাঠানো ও গ্রহণ করা চালিয়ে যেতে পারে। তবে তার ফোন অন্যের মেসেজ সামনে পাঠাবে না।

**মনে রাখবেন:** বেশি Relay ডিভাইস থাকলে যোগাযোগের সম্ভাব্য দূরত্ব বাড়তে পারে। তবে প্রতিটি ধাপে বাস্তব ওয়্যারলেস সংযোগ প্রয়োজন। Mesh-এর যোগাযোগের সীমা অসীম নয়।

## ৬. মেসেজের Status-গুলোর অর্থ কী?

| Status | সহজ অর্থ |
|---|---|
| **Saved Locally** | মেসেজটি আপনার ফোনে সংরক্ষিত হয়েছে। |
| **Queued for Route** | মেসেজটি উপযুক্ত সংযোগ বা পথের অপেক্ষায় আছে। |
| **Sent to Neighbor** | আপনার ফোন কাছাকাছি একটি ডিভাইসে মেসেজ পাঠিয়েছে। |
| **Relayed** | মেসেজটি এক বা একাধিক মাঝখানের ডিভাইসের মাধ্যমে পাঠানো হয়েছে। |
| **Acknowledged** | প্রাপকের ফোন মেসেজ যাচাই করে একটি বৈধ Receipt ফেরত দিয়েছে। |
| **Failed / Expired** | নির্ধারিত সময় বা সীমার মধ্যে মেসেজ পৌঁছানো যায়নি। |

**গুরুত্বপূর্ণ:** `Sent to Neighbor` মানে আপনার বন্ধু মেসেজটি পেয়েছে, এমন নয়। `Acknowledged` হলো প্রাপকের কাছ থেকে পাওয়া আরও শক্তিশালী নিশ্চিতকরণ।

## ৭. Clearfeed Mesh কি নিরাপদ?

Clearfeed Mesh-এ End-to-End Encryption ব্যবহারের পরিকল্পনা রয়েছে।

এর অর্থ হলো, প্রেরকের ডিভাইস মেসেজ এনক্রিপ্ট করবে এবং নির্দিষ্ট প্রাপকের ডিভাইস সেটি ডিক্রিপ্ট করে পড়বে। মাঝখানের Relay ডিভাইসগুলো শুধু এনক্রিপ্ট করা তথ্য সামনে পাঠাবে।

পরিকল্পিত ব্যবস্থায় রয়েছে:

- **Ed25519:** ডিজিটাল স্বাক্ষর এবং পরিচয় যাচাই।
- **X25519:** ক্রিপ্টোগ্রাফিক Secret তৈরি করার জন্য Key Agreement।
- **ChaCha20-Poly1305:** মেসেজ এনক্রিপ্ট করা এবং তথ্য পরিবর্তন হয়েছে কি না যাচাই করা।
- **Safety Fingerprint:** ডিভাইসের পরিচয় যাচাই করতে সাহায্য করা।

তবে কোনো ক্রিপ্টোগ্রাফিক প্রযুক্তির নাম ব্যবহার করলেই একটি অ্যাপ সম্পূর্ণ নিরাপদ হয়ে যায় না। Key Management, সঠিক Implementation, পরীক্ষা এবং Security Review-ও গুরুত্বপূর্ণ।

### নিরাপদ থাকার কিছু নিয়ম

- গুরুত্বপূর্ণ কথোপকথনের আগে Fingerprint যাচাই করুন।
- অ্যাপ ও ডিভাইস আপডেট রাখুন।
- Private Key বা গোপন Security Information অন্যের সঙ্গে শেয়ার করবেন না।
- মনে রাখবেন, এনক্রিপশন মেসেজের বিষয়বস্তু রক্ষা করলেও কাছাকাছি ডিভাইসের উপস্থিতি বা যোগাযোগের সময়ের মতো সব তথ্য গোপন নাও রাখতে পারে।
- ফোনে Screen Lock ব্যবহার করুন।

## ৮. আমার মেসেজ ও ব্যক্তিগত তথ্য কোথায় থাকবে?

পরিকল্পিত ব্যবস্থায় Mesh কথোপকথন এবং Private Key স্থানীয় ডিভাইসে থাকবে। এগুলো স্বয়ংক্রিয়ভাবে Clearfeed-এর অনলাইন সার্ভারে আপলোড করার কথা নয়।

কখনো কোনো Relay ডিভাইস মেসেজের এনক্রিপ্ট করা Packet সাময়িকভাবে সংরক্ষণ করতে পারে, যাতে পরে সেটি সামনে পাঠানো যায়। মেয়াদ শেষ হলে নিয়ম অনুযায়ী সেই Packet মুছে ফেলার কথা।

তবে আপনার ফোন অন্য কেউ আনলক করে ব্যবহার করতে পারলে স্থানীয়ভাবে সংরক্ষিত তথ্য ঝুঁকিতে পড়তে পারে।

আরও মনে রাখবেন, মেসেজ এনক্রিপ্ট করা থাকলেও কে কাছাকাছি আছে, কখন ডিভাইসগুলো যোগাযোগ করছে বা কত তথ্য আদান-প্রদান হচ্ছে, তার কিছু অংশ প্রকাশ পেতে পারে।

**Mesh মেসেজ এবং Clearfeed-এর অনলাইন মেসেজিং আলাদা রাখার পরিকল্পনা করা হয়েছে।** তাই Mesh মেসেজ অন্য ডিভাইসে দেখা যাবে বা অনলাইনে ব্যাকআপ হবে, এমনটি ধরে নেবেন না।

## ৯. কাছাকাছি কেউ না থাকলে কী হবে?

প্রাপকের সঙ্গে যোগাযোগ করা না গেলে:

১. মেসেজটি আপনার ফোনে Queue হয়ে থাকতে পারে।

২. মেসেজের মেয়াদ থাকা অবস্থায় উপযুক্ত সংযোগ বা Relay পথ খোঁজা হতে পারে।

৩. পরে উপযুক্ত ডিভাইস বা সংযোগ পাওয়া গেলে মেসেজটি সামনে পাঠানো যেতে পারে।

৪. মেয়াদ শেষ হলে বা মেসেজ পৌঁছানো সম্ভব না হলে অ্যাপের উচিত সেই অবস্থা দেখানো।

Queue হয়ে থাকা মেসেজ যে অবশ্যই পৌঁছাবে, তার নিশ্চয়তা নেই। আপনার ডিভাইসের অপারেটিং সিস্টেম অনুযায়ী Mesh চালু রাখতে হতে পারে। পরে মেসেজের Status পরীক্ষা করুন।

## ১০. সাধারণ সমস্যা ও সমাধান

**সমস্যা: কাছাকাছি কোনো ব্যবহারকারী দেখা যাচ্ছে না।**

- অন্য ব্যক্তির ফোনে সামঞ্জস্যপূর্ণ Clearfeed Mesh আছে কি না দেখুন।
- Bluetooth এবং Nearby Devices Permission পরীক্ষা করুন।
- ডিভাইসগুলো ওয়্যারলেস যোগাযোগের সীমার মধ্যে রাখুন।
- পরীক্ষা করার সময় অ্যাপটি খোলা রাখুন।
- দুই ডিভাইসেই প্রয়োজনীয় ওয়্যারলেস প্রযুক্তি সমর্থিত কি না নিশ্চিত করুন।

**সমস্যা: মেসেজ `Queued for Route` দেখাচ্ছে।**

বর্তমানে কার্যকর সংযোগ বা Relay পথ পাওয়া যাচ্ছে না। প্রাপকের কাছাকাছি যান অথবা অন্য Relay ডিভাইসের কাছে যান। উপযুক্ত সংযোগের জন্য অপেক্ষা করুন।

**সমস্যা: `Sent to Neighbor` দেখাচ্ছে, কিন্তু বন্ধু মেসেজ পায়নি।**

কাছের ডিভাইসটি হয়তো আপনার বন্ধুর কাছে মেসেজ পৌঁছাতে পারেনি। আরও Relay হয়েছে কি না অথবা প্রাপকের Acknowledgement এসেছে কি না পরীক্ষা করুন।

**সমস্যা: অ্যাপ Background-এ গেলে মেসেজ পাঠানো বন্ধ হয়ে যায়।**

কিছু অপারেটিং সিস্টেম Background-এ Bluetooth কার্যক্রম সীমিত করে। Permission এবং Battery Restriction পরীক্ষা করুন। নির্ভরযোগ্যভাবে পরীক্ষা করার জন্য অ্যাপ খোলা রাখতে হতে পারে।

**সমস্যা: আমার বন্ধু অন্য ফোন বা Desktop ব্যবহার করে।**

দুই ডিভাইসের অ্যাপে একই ধরনের Protocol এবং সামঞ্জস্যপূর্ণ ওয়্যারলেস প্রযুক্তি থাকতে হবে। শুধু Desktop অ্যাপ থাকলেই ফোন থেকে Desktop-এ অফলাইন মেসেজ কাজ করবে, এমন নয়।

## ১১. প্রথম সংস্করণে কোন ফিচারগুলো লক্ষ্য করা হয়েছে?

Clearfeed Mesh-এর নথিভুক্ত প্রথম সংস্করণের লক্ষ্য হলো:

- স্থানীয় পরিচয় তৈরি এবং কাছাকাছি ডিভাইস খোঁজা।
- End-to-End Encrypted Text Messaging।
- সরাসরি এবং Multi-hop মেসেজ পাঠানো।
- একই মেসেজ বারবার Forward হওয়া ঠেকানো।
- স্থানীয় Message Queue এবং Delivery Acknowledgement।
- Relay-এ অংশগ্রহণ চালু বা বন্ধ করার ব্যবস্থা।
- আলাদা Mesh Settings এবং Conversation History।

ছবি, ফাইল শেয়ারিং, Live Voice Call এবং Desktop-to-Mobile অফলাইন যোগাযোগের জন্য অতিরিক্ত কাজ ও পরীক্ষা প্রয়োজন। আপনার ইনস্টল করা সংস্করণে ফিচারটি নিশ্চিতভাবে চালু না থাকলে সেটিকে উপলব্ধ ধরে নেবেন না।

## ১২. শেষ কথা

- Mesh ইন্টারনেট ছাড়াই কাজ করার জন্য তৈরি, কিন্তু স্থানীয় ওয়্যারলেস সংযোগ প্রয়োজন।
- বেশি Relay ডিভাইস থাকলে মেসেজ আরও দূরে পৌঁছাতে পারে।
- Relay ডিভাইসের মেসেজের ভেতরের লেখা পড়তে পারার কথা নয়, যদি End-to-End Encryption সঠিকভাবে বাস্তবায়িত থাকে।
- কাছের ডিভাইসে মেসেজ পাঠানো মানেই প্রাপক মেসেজ পেয়েছে, এমন নয়।
- Queue হওয়া মেসেজ ব্যর্থ হতে পারে বা মেয়াদ শেষ হতে পারে।
- ফোন এবং অপারেটিং সিস্টেমের সীমাবদ্ধতা নির্ভরযোগ্যতাকে প্রভাবিত করতে পারে।
- পরিকল্পিত ব্যবস্থায় Mesh এবং অনলাইন Clearfeed Messaging আলাদা।

---

# Quick Reference | দ্রুত মনে রাখুন

| English | বাংলা |
|---|---|
| **Mesh** | কাছাকাছি ডিভাইসের মাধ্যমে যোগাযোগের নেটওয়ার্ক |
| **Peer** | Mesh-এ অংশ নেওয়া অন্য ডিভাইস |
| **Relay** | অন্য ডিভাইসের মেসেজ সামনে পাঠানো |
| **Encryption** | মেসেজকে এমনভাবে সুরক্ষিত করা, যাতে অনুমোদিত প্রাপক ছাড়া অন্যরা পড়তে না পারে |
| **Fingerprint** | ক্রিপ্টোগ্রাফিক পরিচয় যাচাইয়ের সংক্ষিপ্ত তথ্য |
| **Queue** | পরে পাঠানোর জন্য অপেক্ষমাণ মেসেজ |
| **Acknowledged** | প্রাপকের ডিভাইস থেকে পাওয়া বৈধ নিশ্চিতকরণ |
| **Multi-hop** | একাধিক ডিভাইসের মাধ্যমে মেসেজ পৌঁছানো |

**Clearfeed Mesh: Connect nearby. Communicate offline.**  
**Clearfeed Mesh: কাছাকাছি সংযুক্ত হোন। ইন্টারনেট ছাড়াই যোগাযোগ করুন।**

*Documentation note / নথি সম্পর্কে:* This guide describes the intended Clearfeed Mesh design. Actual feature availability, device compatibility, delivery reliability, security, and background operation depend on the implementation and real-device testing.  
এই নির্দেশিকায় Clearfeed Mesh-এর পরিকল্পিত ব্যবস্থা ব্যাখ্যা করা হয়েছে। বাস্তবে কোন ফিচার কাজ করবে, কোন ডিভাইস সমর্থিত হবে, মেসেজ কতটা নির্ভরযোগ্যভাবে পৌঁছাবে এবং নিরাপত্তা কেমন হবে, তা বাস্তবায়ন ও বাস্তব ডিভাইসে পরীক্ষার ওপর নির্ভরশীল।
