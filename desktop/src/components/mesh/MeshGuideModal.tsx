import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Radio,
  Search,
  ShieldCheck,
  Cpu,
  WifiOff,
  Share2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface MeshGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LangTab = 'all' | 'en' | 'bn';

export const MeshGuideModal: React.FC<MeshGuideModalProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<LangTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('intro');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 bg-neutral-900/80 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Clearfeed Mesh Guide
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                    User Guide | সহজ নির্দেশিকা
                  </span>
                </h2>
                <p className="text-xs text-neutral-400 hidden sm:block">
                  Connect nearby. Communicate offline. | কাছাকাছি সংযুক্ত হোন। ইন্টারনেট ছাড়াই যোগাযোগ করুন।
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer border border-neutral-800"
              title="Close Guide"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Controls Bar: Language Toggle & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            {/* Language Tabs */}
            <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs font-semibold">
              <button
                onClick={() => setLang('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  lang === 'all'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All / উভয় ভাষা
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('bn')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  lang === 'bn'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                বাংলা (Bengali)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guide / নির্দেশিকা খুঁজুন..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-neutral-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 divide-y divide-neutral-800/60 font-sans leading-relaxed text-sm">

          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">100% Zero Internet</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Operates over local Bluetooth / wireless links with zero SIM data or Wi-Fi required.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3">
              <Share2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">Multi-hop Relaying</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Messages bounce securely across intermediate devices to reach friends far away.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-white">End-to-End Encrypted</h4>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  ChaCha20-Poly1305 + Ed25519 ensures relay nodes can never read your messages.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* ENGLISH DOCUMENTATION                                      */}
          {/* ========================================================= */}
          {(lang === 'all' || lang === 'en') && (
            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                  PART 1
                </span>
                <h3 className="text-lg font-bold text-white">ENGLISH DOCUMENTATION</h3>
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-emerald-300">1. What is Clearfeed Mesh?</h4>
                <p className="text-neutral-300 text-xs sm:text-sm">
                  Clearfeed Mesh is an offline messaging feature designed to let people communicate directly with nearby devices without mobile data, Wi-Fi internet, or a central server.
                </p>
                <p className="text-neutral-300 text-xs sm:text-sm">
                  Normally, messaging apps use the internet to send your messages through their servers. Clearfeed Mesh is designed to work differently. It uses nearby devices as communication points. A message can travel directly to its recipient or pass through other Clearfeed Mesh users&apos; devices until it reaches the recipient.
                </p>
                <div className="p-3 bg-neutral-900/80 border-l-4 border-emerald-500 rounded-r-xl text-xs text-neutral-300">
                  <span className="font-bold text-white">Example: </span>
                  Imagine you are in a hostel or campus where the internet is unavailable. You and your friends have Clearfeed Mesh installed. If your devices can connect directly or through other participating devices, you can exchange messages without internet access.
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-emerald-300">2. How does Mesh Messaging work?</h4>
                <p className="text-neutral-300 text-xs sm:text-sm">
                  Think of Clearfeed Mesh like a chain of people passing a sealed envelope:
                </p>

                {/* Relay Visual */}
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-200 flex flex-wrap items-center justify-around gap-3">
                  <div className="text-center">
                    <span className="text-lg">📱</span>
                    <p className="font-bold text-emerald-400">Alice</p>
                    <p className="text-[10px] text-neutral-500">Sender</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600" />
                  <div className="text-center">
                    <span className="text-lg">📱</span>
                    <p className="font-bold text-neutral-300">Bob</p>
                    <p className="text-[10px] text-neutral-500">Relay Node</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600" />
                  <div className="text-center">
                    <span className="text-lg">📱</span>
                    <p className="font-bold text-neutral-300">Charlie</p>
                    <p className="text-[10px] text-neutral-500">Relay Node</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600" />
                  <div className="text-center">
                    <span className="text-lg">📱</span>
                    <p className="font-bold text-emerald-400">David</p>
                    <p className="text-[10px] text-neutral-500">Recipient</p>
                  </div>
                </div>

                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-neutral-300">
                  <li>Alice writes a message for David.</li>
                  <li>Alice&apos;s device encrypts the message so that only David can read it.</li>
                  <li>Bob&apos;s device receives the encrypted message and forwards it.</li>
                  <li>Charlie&apos;s device forwards it again.</li>
                  <li>David&apos;s device receives and decrypts the message.</li>
                </ul>

                <p className="text-neutral-400 text-xs">
                  Bob and Charlie help deliver the message, but they cannot read its contents because it is cryptographically sealed with David&apos;s public key. This is called <strong className="text-white">multi-hop messaging</strong>.
                </p>

                <div className="space-y-1 pt-1">
                  <p className="text-xs font-semibold text-white">What makes this possible?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-neutral-400">
                    <li><strong className="text-neutral-200">Nearby discovery:</strong> Devices search for compatible Clearfeed Mesh devices.</li>
                    <li><strong className="text-neutral-200">Wireless communication:</strong> Supported devices communicate using local wireless technologies (Bluetooth Low Energy, Wi-Fi Direct, Local LAN).</li>
                    <li><strong className="text-neutral-200">Encryption:</strong> Payloads are encrypted with ChaCha20-Poly1305 before forwarding.</li>
                    <li><strong className="text-neutral-200">Relaying:</strong> Participating devices forward encrypted packets toward their destination.</li>
                    <li><strong className="text-neutral-200">Message tracking:</strong> Real-time status reporting (Saved Locally, Queued, Sent to Neighbor, Relayed, Acknowledged).</li>
                  </ul>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-emerald-300">3. Do I need internet or an account?</h4>
                <p className="text-xs sm:text-sm text-neutral-300">
                  The intended Clearfeed Mesh design supports account-free, offline use.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-neutral-800 rounded-xl overflow-hidden">
                    <thead className="bg-neutral-900 text-neutral-300 font-semibold">
                      <tr>
                        <th className="p-2.5 border-b border-neutral-800">Feature</th>
                        <th className="p-2.5 border-b border-neutral-800">Internet required?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                      <tr>
                        <td className="p-2.5">Open Mesh and create a local identity</td>
                        <td className="p-2.5 text-emerald-400 font-medium">No</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Discover nearby compatible devices</td>
                        <td className="p-2.5 text-emerald-400 font-medium">No</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Send a direct message to a reachable device</td>
                        <td className="p-2.5 text-emerald-400 font-medium">No</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Relay messages through nearby devices</td>
                        <td className="p-2.5 text-emerald-400 font-medium">No, if a working relay route exists</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Use Clearfeed&apos;s online timeline and cloud messaging</td>
                        <td className="p-2.5 text-amber-400 font-medium">Yes</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Automatically back up Mesh conversations to the cloud</td>
                        <td className="p-2.5 text-neutral-400">Not part of the intended design</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-amber-300/90 font-medium">
                  Important: Offline messaging does not mean you can contact anyone anywhere in the world. Your recipient must be reachable through a compatible wireless connection or a chain of participating devices.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-emerald-300">4. How can I start using Clearfeed Mesh?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">Step 1: Install and open Clearfeed</span>
                    <p className="text-xs text-neutral-300">
                      Open the app and select <strong>Mesh</strong> in the left sidebar. No sign-in or account is required.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">Step 2: Create your local identity</span>
                    <p className="text-xs text-neutral-300">
                      Choose a nickname (e.g. <code>Alice</code>, <code>Rahim</code>, or <code>Student 01</code>). A unique 32-byte Ed25519 cryptographic keypair is generated locally on your device.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">Step 3: Enable the required permissions</span>
                    <p className="text-xs text-neutral-300">
                      Enable Bluetooth and nearby device access if prompted. No internet is used.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">Step 4: Discover nearby users</span>
                    <p className="text-xs text-neutral-300">
                      Open <strong>Peers</strong> tab to see nearby compatible devices, or click <strong>+ Add Peer Key</strong> to paste a friend&apos;s 64-char public key.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">Step 5: Verify the recipient</span>
                    <p className="text-xs text-neutral-300">
                      For high security, verify safety fingerprints with your friend in person to guarantee you are speaking to the intended device.
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">Step 6: Send a message</span>
                    <p className="text-xs text-neutral-300">
                      Type your message and click <strong>Send</strong>. The packet will be encrypted, dispatched, and tracked until acknowledged.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-emerald-300">6. What do the message statuses mean?</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-neutral-800 rounded-xl overflow-hidden">
                    <thead className="bg-neutral-900 text-neutral-300 font-semibold">
                      <tr>
                        <th className="p-2.5 border-b border-neutral-800">Status</th>
                        <th className="p-2.5 border-b border-neutral-800">Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                      <tr>
                        <td className="p-2.5 font-bold text-neutral-300">Saved Locally</td>
                        <td className="p-2.5">The message has been saved on your device.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-amber-400">Queued for Route</td>
                        <td className="p-2.5">The message is waiting for a suitable connection or route.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-sky-400">Sent to Neighbor</td>
                        <td className="p-2.5">Your device transmitted the message to a nearby device.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-indigo-400">Relayed</td>
                        <td className="p-2.5">The message was forwarded through one or more intermediate devices.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-emerald-400">Acknowledged</td>
                        <td className="p-2.5">The recipient&apos;s device verified the message and returned a valid receipt.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-400">Failed / Expired</td>
                        <td className="p-2.5">The message could not be delivered within its allowed limits or time.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 7 & 8 */}
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-emerald-300">7. Is Clearfeed Mesh secure?</h4>
                <p className="text-xs sm:text-sm text-neutral-300">
                  Clearfeed Mesh uses end-to-end encryption. The sender encrypts the message, and only the recipient can decrypt it:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="text-emerald-400 font-bold block">Ed25519</span>
                    Digital signatures & identity verification.
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="text-emerald-400 font-bold block">X25519</span>
                    Diffie-Hellman cryptographic key agreement.
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="text-emerald-400 font-bold block">ChaCha20-Poly1305</span>
                    AEAD symmetric packet encryption & integrity.
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800">
                    <span className="text-emerald-400 font-bold block">Safety Fingerprints</span>
                    Short cryptographic identity confirmation.
                  </div>
                </div>
              </div>

              {/* Section 10 */}
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-emerald-300">10. Common Problems & Solutions</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
                    <span className="font-bold text-white">Problem: I cannot see any nearby users.</span>
                    <p className="text-neutral-400 mt-1">
                      Ensure Bluetooth is turned on, both devices have Clearfeed Mesh open, and you are within wireless range (approx. 10–30 meters indoors).
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
                    <span className="font-bold text-white">Problem: My message says “Queued for Route”.</span>
                    <p className="text-neutral-400 mt-1">
                      There is no active connection or relay path available right now. Move closer to the recipient or another participating relay device.
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
                    <span className="font-bold text-white">Problem: Messages stop when the app is in the background.</span>
                    <p className="text-neutral-400 mt-1">
                      Some operating systems throttle background Bluetooth. Keep the app open for optimal multi-hop relaying.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* BANGLA DOCUMENTATION (বাংলা ডকুমেন্টেশন)                  */}
          {/* ========================================================= */}
          {(lang === 'all' || lang === 'bn') && (
            <div className="space-y-6 pt-6 font-sans">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
                  PART 2
                </span>
                <h3 className="text-lg font-bold text-white">বাংলা ডকুমেন্টেশন (BANGLA GUIDE)</h3>
              </div>

              {/* অধ্যায় ১ */}
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-emerald-300">১. Clearfeed Mesh কী?</h4>
                <p className="text-neutral-300 text-xs sm:text-sm">
                  Clearfeed Mesh হলো Clearfeed-এর একটি অফলাইন মেসেজিং ব্যবস্থা, যার মাধ্যমে কাছাকাছি থাকা ডিভাইসগুলোর মধ্যে ইন্টারনেট বা মোবাইল ডাটা ছাড়াই বার্তা আদান-প্রদান করার পরিকল্পনা করা হয়েছে।
                </p>
                <p className="text-neutral-300 text-xs sm:text-sm">
                  সাধারণত WhatsApp বা Messenger-এর মতো অ্যাপ ইন্টারনেটের মাধ্যমে সার্ভারে মেসেজ পাঠায়। কিন্তু Clearfeed Mesh-এর ধারণা আলাদা। এখানে কাছাকাছি থাকা ডিভাইসগুলো নিজেদের মধ্যে সরাসরি যোগাযোগ করে। প্রয়োজন হলে অন্য ব্যবহারকারীর ডিভাইসের মাধ্যমে একটি মেসেজ তার গন্তব্যে পৌঁছাতে পারে।
                </p>
                <div className="p-3 bg-neutral-900/80 border-l-4 border-emerald-500 rounded-r-xl text-xs text-neutral-300">
                  <span className="font-bold text-white">উদাহরণ: </span>
                  আপনি একটি হোস্টেলে বা ক্যাম্পাসে আছেন, কিন্তু সেখানে ইন্টারনেট নেই। আপনার এবং আপনার বন্ধুদের ফোনে Clearfeed Mesh চালু আছে। আপনাদের ডিভাইস সরাসরি অথবা মাঝখানে অন্য ব্যবহারকারীর ডিভাইসের মাধ্যমে সংযুক্ত হতে পারলে আপনারা ইন্টারনেট ছাড়াই মেসেজ আদান-প্রদান করতে পারবেন।
                </div>
              </div>

              {/* অধ্যায় ২ */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-emerald-300">২. Mesh Messaging কীভাবে কাজ করে?</h4>
                <p className="text-neutral-300 text-xs sm:text-sm">
                  ধরুন, Alice তার বন্ধু David-কে একটি মেসেজ পাঠাতে চায়। কিন্তু David-এর ফোন Alice-এর ফোনের সরাসরি যোগাযোগের সীমার বাইরে। মাঝখানে Bob এবং Charlie আছে:
                </p>

                {/* ডায়াগ্রাম */}
                <div className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-200 flex flex-wrap items-center justify-around gap-3">
                  <div className="text-center">
                    <span className="text-lg">📱</span>
                    <p className="font-bold text-emerald-400">Alice</p>
                    <p className="text-[10px] text-neutral-500">প্রেরক (Sender)</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600" />
                  <div className="text-center">
                    <span className="text-lg">📱</span>
                    <p className="font-bold text-neutral-300">Bob</p>
                    <p className="text-[10px] text-neutral-500">রিলে নোড (Relay)</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600" />
                  <div className="text-center">
                    <span className="text-lg">📱</span>
                    <p className="font-bold text-neutral-300">Charlie</p>
                    <p className="text-[10px] text-neutral-500">রিলে নোড (Relay)</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600" />
                  <div className="text-center">
                    <span className="text-lg">📱</span>
                    <p className="font-bold text-emerald-400">David</p>
                    <p className="text-[10px] text-neutral-500">প্রাপক (Recipient)</p>
                  </div>
                </div>

                <ul className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-neutral-300">
                  <li>Alice তার ফোনে David-এর জন্য একটি মেসেজ লেখে।</li>
                  <li>Alice-এর ফোন মেসেজটি এনক্রিপ্ট করে, যাতে নির্দিষ্ট প্রাপক David ছাড়া অন্য কেউ মেসেজের বিষয়বস্তু পড়তে না পারে।</li>
                  <li>Bob-এর ফোন এনক্রিপ্ট করা মেসেজটি গ্রহণ করে এবং সামনে Charlie-এর কাছে পাঠায়।</li>
                  <li>Charlie-এর ফোন মেসেজটি আবার সামনে David-এর ফোনে পাঠায়।</li>
                  <li>David-এর ফোন মেসেজটি গ্রহণ করে এবং ডিক্রিপ্ট করে পড়তে পারে।</li>
                </ul>

                <p className="text-neutral-400 text-xs">
                  Bob এবং Charlie মেসেজ পৌঁছাতে সাহায্য করে, কিন্তু তাদের মেসেজের ভেতরের লেখা পড়তে পারার কথা নয়। এভাবে একাধিক ডিভাইসের মাধ্যমে মেসেজ পাঠানোর পদ্ধতিকে <strong className="text-white">Multi-hop Messaging</strong> বলে। যে ডিভাইস অন্যের মেসেজ সামনে পাঠায়, তাকে <strong className="text-white">Relay Node</strong> বলা হয়।
                </p>
              </div>

              {/* অধ্যায় ৩ */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-emerald-300">৩. Clearfeed Mesh ব্যবহার করতে কি ইন্টারনেট বা অ্যাকাউন্ট লাগবে?</h4>
                <p className="text-xs sm:text-sm text-neutral-300">
                  Clearfeed Mesh-এর পরিকল্পিত ব্যবস্থায় অ্যাকাউন্ট ছাড়াই অফলাইনে যোগাযোগ করা যাবে।
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-neutral-800 rounded-xl overflow-hidden">
                    <thead className="bg-neutral-900 text-neutral-300 font-semibold">
                      <tr>
                        <th className="p-2.5 border-b border-neutral-800">কাজ</th>
                        <th className="p-2.5 border-b border-neutral-800">ইন্টারনেট লাগবে?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                      <tr>
                        <td className="p-2.5">Mesh চালু করে স্থানীয় পরিচয় তৈরি করা</td>
                        <td className="p-2.5 text-emerald-400 font-medium">না</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">কাছাকাছি থাকা সামঞ্জস্যপূর্ণ ডিভাইস খোঁজা</td>
                        <td className="p-2.5 text-emerald-400 font-medium">না</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">সরাসরি যোগাযোগ করা যায় এমন ডিভাইসে মেসেজ পাঠানো</td>
                        <td className="p-2.5 text-emerald-400 font-medium">না</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">অন্য ডিভাইসের মাধ্যমে মেসেজ পাঠানো</td>
                        <td className="p-2.5 text-emerald-400 font-medium">না, যদি কার্যকর Relay পথ থাকে</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Clearfeed-এর অনলাইন মেসেজিং ও Timeline ব্যবহার করা</td>
                        <td className="p-2.5 text-amber-400 font-medium">হ্যাঁ</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">Mesh মেসেজ স্বয়ংক্রিয়ভাবে ক্লাউডে ব্যাকআপ করা</td>
                        <td className="p-2.5 text-neutral-400">পরিকল্পিত ব্যবস্থার অংশ নয়</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-amber-300/90 font-medium">
                  মনে রাখবেন: ইন্টারনেট ছাড়া মেসেজ পাঠানো সম্ভব হলেও পৃথিবীর যেকোনো জায়গায় থাকা কাউকে সরাসরি মেসেজ পাঠানো যাবে না। প্রাপকের কাছে পৌঁছানোর মতো ওয়্যারলেস সংযোগ অথবা Relay ডিভাইসের একটি কার্যকর পথ থাকতে হবে।
                </p>
              </div>

              {/* অধ্যায় ৪ */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-emerald-300">৪. কীভাবে Clearfeed Mesh ব্যবহার শুরু করবেন?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">ধাপ ১: Clearfeed খুলুন</span>
                    <p className="text-xs text-neutral-300">
                      অ্যাপ খুলে সাইডবারে <strong>Mesh</strong> অপশনে যান। অনলাইন অ্যাকাউন্টে লগইন না করেও এটি ব্যবহার করা যায়।
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">ধাপ ২: স্থানীয় পরিচয় তৈরি করুন</span>
                    <p className="text-xs text-neutral-300">
                      একটি Nickname নির্বাচন করুন (যেমন: <code>Alice</code>, <code>Rahim</code>, বা <code>Student 01</code>)। আপনার ফোনে একটি সম্পূর্ণ স্থানীয় ক্রিপ্টোগ্রাফিক কী-জোড়া তৈরি হবে।
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">ধাপ ৩: Permission চালু করুন</span>
                    <p className="text-xs text-neutral-300">
                      Bluetooth এবং Nearby Devices পারমিশন চালু রাখুন। কোনো ইন্টারনেট সংযোগ লাগবে না।
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">ধাপ ৪: কাছাকাছি ব্যবহারকারীদের খুঁজুন</span>
                    <p className="text-xs text-neutral-300">
                      <strong>Peers</strong> ট্যাবে গিয়ে কাছাকাছি ডিভাইস দেখুন অথবা <strong>+ Add Peer Key</strong> চেপে বন্ধুর পাবলিক কী যোগ করুন।
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">ধাপ ৫: প্রাপকের পরিচয় যাচাই করুন</span>
                    <p className="text-xs text-neutral-300">
                      উচ্চ নিরাপত্তার জন্য সামনাসামনি Safety Fingerprint মিলিয়ে নিন, যাতে নিশ্চিত হওয়া যায় নির্দিষ্ট ডিভাইসের সঙ্গেই কথা হচ্ছে।
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-emerald-400">ধাপ ৬: মেসেজ পাঠান</span>
                    <p className="text-xs text-neutral-300">
                      কথোপকথন খুলে মেসেজ লিখে <strong>Send</strong> চাপুন। উপযুক্ত রুট পেলেই মেসেজটি এনক্রিপ্ট হয়ে পৌঁছে যাবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* অধ্যায় ৬ */}
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-emerald-300">৬. মেসেজের Status-গুলোর অর্থ কী?</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-neutral-800 rounded-xl overflow-hidden">
                    <thead className="bg-neutral-900 text-neutral-300 font-semibold">
                      <tr>
                        <th className="p-2.5 border-b border-neutral-800">Status</th>
                        <th className="p-2.5 border-b border-neutral-800">সহজ অর্থ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                      <tr>
                        <td className="p-2.5 font-bold text-neutral-300">Saved Locally</td>
                        <td className="p-2.5">মেসেজটি আপনার ফোনে সংরক্ষিত হয়েছে।</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-amber-400">Queued for Route</td>
                        <td className="p-2.5">মেসেজটি উপযুক্ত সংযোগ বা পথের অপেক্ষায় আছে।</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-sky-400">Sent to Neighbor</td>
                        <td className="p-2.5">আপনার ফোন কাছাকাছি একটি ডিভাইসে মেসেজ পাঠিয়েছে।</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-indigo-400">Relayed</td>
                        <td className="p-2.5">মেসেজটি এক বা একাধিক মাঝখানের ডিভাইসের মাধ্যমে পাঠানো হয়েছে।</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-emerald-400">Acknowledged</td>
                        <td className="p-2.5">প্রাপকের ফোন মেসেজ যাচাই করে একটি বৈধ Receipt ফেরত দিয়েছে।</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-rose-400">Failed / Expired</td>
                        <td className="p-2.5">নির্ধারিত সময় বা সীমার মধ্যে মেসেজ পৌঁছানো যায়নি।</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* অধ্যায় ১০ */}
              <div className="space-y-2">
                <h4 className="text-base font-semibold text-emerald-300">১০. সাধারণ সমস্যা ও সমাধান</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
                    <span className="font-bold text-white">সমস্যা: কাছাকাছি কোনো ব্যবহারকারী দেখা যাচ্ছে না।</span>
                    <p className="text-neutral-400 mt-1">
                      Bluetooth চালু আছে কি না এবং অপর ব্যক্তির অ্যাপে Mesh খোলা আছে কি না তা দেখুন। ডিভাইসগুলো ওয়্যারলেস রেঞ্জের মধ্যে রাখুন।
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
                    <span className="font-bold text-white">সমস্যা: মেসেজ `Queued for Route` দেখাচ্ছে।</span>
                    <p className="text-neutral-400 mt-1">
                      বর্তমানে কার্যকর কোনো পাথ নেই। প্রাপকের বা কোনো রিলে ডিভাইসের কাছে যান এবং উপযুক্ত সংযোগের অপেক্ষা করুন।
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800">
                    <span className="font-bold text-white">সমস্যা: অ্যাপ Background-এ গেলে মেসেজ পাঠানো বন্ধ হয়ে যায়।</span>
                    <p className="text-neutral-400 mt-1">
                      কিছু অপারেটিং সিস্টেমে ব্যাকগ্রাউন্ড ব্লুটুথ থ্রোটল করে। পরীক্ষার সময় অ্যাপটি ফোরগ্রাউন্ডে চালু রাখুন।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* QUICK REFERENCE / দ্রুত মনে রাখুন                           */}
          {/* ========================================================= */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Quick Reference | দ্রুত মনে রাখুন</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-800 rounded-xl overflow-hidden">
                <thead className="bg-neutral-900 text-neutral-300 font-semibold">
                  <tr>
                    <th className="p-2.5 border-b border-neutral-800">English Term</th>
                    <th className="p-2.5 border-b border-neutral-800">বাংলা অর্থ ও ব্যাখ্যা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">Mesh</td>
                    <td className="p-2.5">কাছাকাছি ডিভাইসের মাধ্যমে যোগাযোগের নেটওয়ার্ক</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">Peer</td>
                    <td className="p-2.5">Mesh-এ অংশ নেওয়া অন্য কোনো ডিভাইস বা ব্যবহারকারী</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">Relay</td>
                    <td className="p-2.5">অন্য ডিভাইসের এনক্রিপ্ট করা মেসেজ না পড়েই সামনে পাঠানো</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">Encryption</td>
                    <td className="p-2.5">মেসেজকে সুরক্ষিত করা, যাতে অনুমোদিত প্রাপক ছাড়া কেউ পড়তে না পারে</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">Fingerprint</td>
                    <td className="p-2.5">ক্রিপ্টোগ্রাফিক পরিচয় ও ডিভাইস যাচাইয়ের সংক্ষিপ্ত কোড</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">Queue</td>
                    <td className="p-2.5">রুট বা সংযোগ পাওয়ার অপেক্ষায় ফোনে সংরক্ষিত মেসেজ</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">Acknowledged</td>
                    <td className="p-2.5">প্রাপকের ডিভাইস থেকে পাওয়া ডিজিটাল রসিদ বা নিশ্চিতকরণ</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-400">Multi-hop</td>
                    <td className="p-2.5">একাধিক ডিভাইসের মাধ্যমে ধাপে ধাপে মেসেজ গন্তব্যে পৌঁছানো</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-1 text-xs text-neutral-400">
              <p className="font-semibold text-emerald-400">
                Clearfeed Mesh: Connect nearby. Communicate offline.
              </p>
              <p className="text-neutral-300">
                কাছাকাছি সংযুক্ত হোন। ইন্টারনেট ছাড়াই যোগাযোগ করুন।
              </p>
              <p className="text-[11px] text-neutral-500 pt-1">
                *Documentation note: This guide describes the intended Clearfeed Mesh design. Actual feature availability, device compatibility, delivery reliability, security, and background operation depend on the implementation and real-device testing.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            CFM1 Protocol Verified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Got it / বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeshGuideModal;
