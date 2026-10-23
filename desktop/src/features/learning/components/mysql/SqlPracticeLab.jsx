import React, { useState, useEffect } from 'react';
import { 
  Play, RotateCcw, Database, Table, Clock, CheckCircle2, 
  AlertCircle, History, Terminal, Code2, ChevronRight, Copy, Check, Sparkles
} from 'lucide-react';
import { executeQuery, resetDatabase, getDatabaseSchema, getDatabaseNames, executeMultipleQueries } from './sqlEngine';

export const SqlPracticeLab = ({ initialQuery = '', onBack }) => {
  const [selectedDb, setSelectedDb] = useState('ecommerce_db');
  const [query, setQuery] = useState(initialQuery || 'SELECT * FROM products LIMIT 5;');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([
    'SELECT * FROM products LIMIT 5;',
    'SELECT c.category_name, COUNT(p.product_id) AS total_products FROM categories c LEFT JOIN products p ON c.category_id = p.category_id GROUP BY c.category_id, c.category_name;',
    'SELECT order_id, customer_id, total_amount, status FROM orders WHERE total_amount > 100 ORDER BY total_amount DESC;'
  ]);
  const [schema, setSchema] = useState(getDatabaseSchema('ecommerce_db'));
  const [activeTab, setActiveTab] = useState('results'); // 'results', 'schema', 'history'
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setSchema(getDatabaseSchema(selectedDb));
  }, [selectedDb]);

  const handleRun = () => {
    if (!query.trim()) return;
    const res = executeMultipleQueries(query, selectedDb);
    setResult(res);
    setActiveTab('results');
    setSchema(getDatabaseSchema(selectedDb));

    setHistory(prev => {
      const filtered = prev.filter(q => q.trim() !== query.trim());
      return [query.trim(), ...filtered].slice(0, 20);
    });
  };

  const handleReset = () => {
    setIsResetting(true);
    resetDatabase();
    setSchema(getDatabaseSchema(selectedDb));
    setResult({
      success: true,
      message: 'Database state has been reset to default sample data.',
      columns: [],
      rows: [],
      affectedRows: 0,
      executionTimeMs: 1
    });
    setTimeout(() => setIsResetting(false), 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const quickTemplates = [
    { label: 'View Products', sql: 'SELECT product_id, product_name, price, stock_quantity FROM products LIMIT 10;' },
    { label: 'Top Categories (JOIN)', sql: 'SELECT c.category_name, COUNT(p.product_id) AS product_count, ROUND(AVG(p.price), 2) AS avg_price\nFROM categories c\nINNER JOIN products p ON c.category_id = p.category_id\nGROUP BY c.category_id, c.category_name;' },
    { label: 'Customer Orders', sql: 'SELECT c.first_name, c.last_name, o.order_id, o.total_amount, o.status\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nORDER BY o.total_amount DESC;' },
    { label: 'Insert New Category', sql: 'INSERT INTO categories (category_name, description)\nVALUES ("Smart Home", "Connected IoT devices and automations");\n\nSELECT * FROM categories;' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[640px]">
      {/* Top Header Bar */}
      <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              ← Back to Lesson
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              MySQL Interactive Practice Sandbox
            </h3>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
            MySQL 8.0 Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Database Selector */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Database:</span>
            <select
              value={selectedDb}
              onChange={(e) => setSelectedDb(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 font-mono"
            >
              {getDatabaseNames().map(db => (
                <option key={db} value={db}>{db}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset database to default sample rows"
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-amber-400' : ''}`} />
            <span>Reset DB</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Schema + Editor + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        {/* Left Column: Schema Browser (3 cols) */}
        <div className="lg:col-span-3 bg-slate-950/50 border-r border-slate-800 p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-cyan-400" />
              Tables & Schema
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {Object.keys(schema).length} tables
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1 custom-scrollbar text-xs">
            {Object.entries(schema).map(([tableName, info]) => (
              <div 
                key={tableName} 
                className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-medium text-cyan-300 flex items-center gap-1">
                    <span className="text-slate-500">▶</span> {tableName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                    {info.rowCount} rows
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1 pl-2 border-l border-slate-800">
                  {info.columns.slice(0, 6).map(col => (
                    <span key={col} className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                      {col}
                    </span>
                  ))}
                  {info.columns.length > 6 && (
                    <span className="text-[10px] text-slate-500">+{info.columns.length - 6} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Query Templates */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Templates
            </span>
            <div className="flex flex-col gap-1">
              {quickTemplates.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(t.sql)}
                  className="text-left text-[11px] text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 px-2 py-1 rounded transition-colors truncate"
                >
                  ⚡ {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Results (9 cols) */}
        <div className="lg:col-span-9 flex flex-col">
          {/* Editor Area */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                <span>SQL Query Editor</span>
                <span className="text-[10px] text-slate-500">(Press Ctrl + Enter to run)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleRun}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-lg shadow-md hover:shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Query</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleRun();
                  }
                }}
                rows={5}
                placeholder="Write your MySQL query here (e.g. SELECT * FROM products WHERE price > 50;)"
                className="w-full bg-slate-950 font-mono text-sm text-emerald-400 placeholder-slate-600 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Results Tab Navigation */}
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'results' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Output Results
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-md font-medium flex items-center gap-1 transition-colors ${
                  activeTab === 'history' 
                    ? 'bg-slate-800 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3 h-3" />
                History ({history.length})
              </button>
            </div>

            {result && (
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                {result.success ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Success
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Query Error
                  </span>
                )}
                {result.executionTimeMs !== undefined && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {result.executionTimeMs}ms
                  </span>
                )}
                {result.rows && (
                  <span>{result.rows.length} rows returned</span>
                )}
                {result.affectedRows !== undefined && result.affectedRows > 0 && (
                  <span className="text-blue-400">{result.affectedRows} row(s) affected</span>
                )}
              </div>
            )}
          </div>

          {/* Tab Body: Results View */}
          {activeTab === 'results' && (
            <div className="flex-1 p-3 bg-slate-950 overflow-auto max-h-[380px] custom-scrollbar">
              {!result && (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Terminal className="w-8 h-8 mb-2 text-slate-600" />
                  <p>Click "Run Query" or press Ctrl+Enter to view execution output.</p>
                </div>
              )}

              {result && !result.success && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 font-mono text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-rose-200">MySQL Execution Error</div>
                    <div className="mt-1">{result.error}</div>
                  </div>
                </div>
              )}

              {result && result.success && (
                <div className="space-y-3">
                  {result.message && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs font-mono">
                      {result.message}
                    </div>
                  )}

                  {result.columns && result.columns.length > 0 ? (
                    <div className="border border-slate-800 rounded-lg overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800">
                            {result.columns.map((col, idx) => (
                              <th key={idx} className="px-3 py-2 text-slate-300 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                          {result.rows.length === 0 ? (
                            <tr>
                              <td colSpan={result.columns.length} className="px-3 py-4 text-center text-slate-500">
                                0 rows returned
                              </td>
                            </tr>
                          ) : (
                            result.rows.map((row, rowIdx) => (
                              <tr key={rowIdx} className="hover:bg-slate-900/40 transition-colors">
                                {result.columns.map((col, colIdx) => {
                                  const val = row[col];
                                  const isNull = val === null || val === undefined;
                                  return (
                                    <td key={colIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-300">
                                      {isNull ? (
                                        <span className="text-amber-400/80 italic font-sans text-[11px]">NULL</span>
                                      ) : typeof val === 'number' ? (
                                        <span className="text-cyan-400">{val}</span>
                                      ) : (
                                        <span>{String(val)}</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* Tab Body: History View */}
          {activeTab === 'history' && (
            <div className="flex-1 p-3 bg-slate-950 overflow-auto max-h-[380px] custom-scrollbar">
              <div className="space-y-2">
                {history.map((hQuery, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                  >
                    <code className="text-xs font-mono text-slate-300 truncate flex-1">
                      {hQuery}
                    </code>
                    <button
                      onClick={() => {
                        setQuery(hQuery);
                        setActiveTab('results');
                      }}
                      className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Load</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
