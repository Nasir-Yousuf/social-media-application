import React, { useState, useEffect } from 'react';
import { Code2, Search, Copy, Check, Filter, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { Post } from '../types';

export const CodeHubView: React.FC = () => {
  const [snippets, setSnippets] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('all');

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/code-snippets');
      if (res.data?.posts) {
        setSnippets(res.data.posts);
      }
    } catch {
      // Graceful error fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSnippets = snippets.filter((s) => {
    if (selectedLang === 'all') return true;
    return s.codeSnippet?.language?.toLowerCase() === selectedLang.toLowerCase();
  });

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            Code Hub
          </h2>
          <p className="text-xs text-neutral-400">
            Cohort code snippets, algorithm solutions, and reusable course utilities.
          </p>
        </div>
        <button
          onClick={fetchSnippets}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-medium transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Language filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'javascript', 'typescript', 'python', 'rust', 'sql', 'cpp'].map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className={`px-3 py-1 rounded-xl text-xs font-medium uppercase font-mono transition cursor-pointer ${
              selectedLang === lang
                ? 'bg-emerald-500 text-white font-bold'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500">
          Loading code snippets...
        </div>
      ) : filteredSnippets.length === 0 ? (
        <div className="p-12 text-center text-xs text-neutral-500 bg-neutral-900/40 rounded-2xl border border-neutral-800">
          No code snippets found for this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSnippets.map((item) => (
            <div
              key={item._id}
              className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {item.author?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">
                      {item.author?.name || 'Classmate'}
                    </h4>
                    <p className="text-[10px] text-neutral-500">@{item.author?.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-neutral-800 text-emerald-400 font-mono text-[10px] rounded-lg border border-neutral-700">
                    {item.codeSnippet?.language || 'code'}
                  </span>
                  {item.codeSnippet?.code && (
                    <button
                      onClick={() => handleCopy(item._id, item.codeSnippet!.code)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition cursor-pointer"
                    >
                      {copiedId === item._id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedId === item._id ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>

              {item.content && (
                <p className="text-xs text-neutral-300">{item.content}</p>
              )}

              {item.codeSnippet?.code && (
                <div className="p-3 bg-neutral-950 rounded-xl font-mono text-xs overflow-x-auto text-emerald-400 border border-neutral-800">
                  <pre>
                    <code>{item.codeSnippet.code}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeHubView;
