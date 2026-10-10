import React, { useState } from 'react';
import { Database, Search, ArrowRight, FileText, Bot } from 'lucide-react';

export default function RagSearchSimulator() {
  const [query, setQuery] = useState('What is the return refund policy?');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);

  const mockDocuments = [
    { id: 1, title: 'Company_Policy_2026.pdf', chunk: 'Refund policy allows customer returns within 30 days of purchase with original receipt.', score: 0.94 },
    { id: 2, title: 'Shipping_Guide.pdf', chunk: 'Standard ground shipping takes 3-5 business days across domestic routes.', score: 0.21 },
    { id: 3, title: 'Employee_Handbook.pdf', chunk: 'Office hours are 9:00 AM to 5:00 PM EST Monday through Friday.', score: 0.08 },
  ];

  const runRagSearch = () => {
    setIsSearching(true);
    setResult(null);
    setTimeout(() => {
      setIsSearching(false);
      setResult(mockDocuments[0]);
    }, 600);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white my-6 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Database className="w-6 h-6" />
            RAG Vector Database & Retrieval Simulator
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Simulate how a Vector DB retrieves matching document chunks and injects them directly into the LLM prompt context!
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              placeholder="Ask a question about internal company documents..."
            />
          </div>
          <button
            onClick={runRagSearch}
            disabled={isSearching}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2"
          >
            {isSearching ? 'Retrieving Vector Chunks...' : 'Run RAG Search'}
          </button>
        </div>

        {/* Vector DB Chunks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mockDocuments.map((doc) => (
            <div
              key={doc.id}
              className={`p-4 rounded-xl border transition ${
                result && result.id === doc.id
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <FileText className="w-4 h-4 text-sky-400" />
                  {doc.title}
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    doc.score > 0.8
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  Cosine Score: {doc.score}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-3">{doc.chunk}</p>
            </div>
          ))}
        </div>

        {/* LLM Prompt Context Injection Output */}
        {result && (
          <div className="bg-slate-950 p-5 rounded-xl border border-emerald-500/40 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Bot className="w-4 h-4" />
              Injected LLM Context Prompt Payload
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <div className="text-purple-400">System: Answer using ONLY the retrieved context below.</div>
              <div className="text-emerald-400">Context: "{result.chunk}"</div>
              <div className="text-sky-400">User Question: "{query}"</div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-medium flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
              LLM Output: "According to Company_Policy_2026.pdf, refunds are allowed within 30 days of purchase with receipt."
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
