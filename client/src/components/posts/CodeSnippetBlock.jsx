import React, { useState } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Files,
  FileCode,
  FolderGit2,
  Terminal,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { FileTabIcon, normalizeSnippetFiles, getFileMeta } from './vscodeUtils';
import SyntaxHighlighter from './SyntaxHighlighter';

export const CodeSnippetBlock = ({
  snippet,
  defaultExpanded = false,
  className = '',
}) => {
  const files = normalizeSnippetFiles(snippet);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (!files || files.length === 0) return null;

  // Ensure active index is in range
  const safeIndex = Math.min(activeTabIndex, files.length - 1);
  const activeFile = files[safeIndex] || files[0];
  const fileMeta = getFileMeta(activeFile.name, activeFile.language);

  const lines = (activeFile.code || '').split('\n');
  const lineCount = lines.length;
  const isLong = lineCount > 16;
  const displayCode = isLong && !isExpanded ? lines.slice(0, 16).join('\n') : activeFile.code;
  const displayLinesCount = isLong && !isExpanded ? 16 : lineCount;

  const handleCopyCurrent = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(activeFile.code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleCopyAll = (e) => {
    e.stopPropagation();
    const allText = files
      .map((f) => `/* =================== File: ${f.name} =================== */\n${f.code}`)
      .join('\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div
      className={`mt-3 rounded-xl border border-[var(--color-cf-border)] dark:border-[var(--color-cfd-border)] bg-[#1e1e1e] overflow-hidden shadow-md select-text font-mono text-xs group/vscode transition-all ${className}`}
    >
      {/* VS Code Window Header / Title Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#181818] border-b border-[#252526] select-none text-[11px] text-[#858585]">
        {/* Left: Window Traffic Lights + Snippet Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 border border-[#e0443e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 border border-[#dea123]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 border border-[#1aab29]" />
          </div>

          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="text-[var(--color-cf-accent)] font-bold">CF</span>
            <span className="text-[#cccccc] font-medium truncate">
              {snippet.title || 'Clearfeed Workspace'}
            </span>
            {files.length > 1 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#252526] text-[#858585] shrink-0">
                {files.length} files
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Actions (Copy file / Copy All) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {files.length > 1 && (
            <button
              type="button"
              onClick={handleCopyAll}
              title="Copy all project files"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-[#858585] hover:text-[#cccccc] hover:bg-white/5 transition-colors cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3 h-3 text-[#00ba7c]" strokeWidth={2.5} />
                  <span className="text-[#00ba7c] font-semibold">All Copied</span>
                </>
              ) : (
                <>
                  <Files className="w-3 h-3" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyCurrent}
            title={`Copy ${activeFile.name}`}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[#252526] hover:bg-[#333333] text-[#cccccc] hover:text-white border border-[#3c3c3c] transition-colors cursor-pointer"
          >
            {copiedFile ? (
              <>
                <Check className="w-3 h-3 text-[#00ba7c]" strokeWidth={2.5} />
                <span className="text-[#00ba7c] font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#858585]" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* VS Code Tab Bar (Horizontally scrollable with active tab indicator) */}
      <div className="flex items-center bg-[#141414] border-b border-[#252526] overflow-x-auto no-scrollbar select-none">
        {files.map((file, idx) => {
          const isActive = idx === safeIndex;
          const meta = getFileMeta(file.name, file.language);

          return (
            <button
              key={`${file.name}-${idx}`}
              type="button"
              onClick={() => setActiveTabIndex(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono border-r border-[#252526] transition-all cursor-pointer shrink-0 relative ${
                isActive
                  ? 'bg-[#1e1e1e] text-[#ffffff] font-semibold border-t-2 border-t-[#007acc]'
                  : 'bg-[#141414] text-[#858585] hover:bg-[#1a1a1a] hover:text-[#cccccc] border-t-2 border-t-transparent'
              }`}
            >
              <FileTabIcon filename={file.name} language={file.language} size="sm" />
              <span className="truncate max-w-[150px]">{file.name}</span>
            </button>
          );
        })}
      </div>

      {/* VS Code Breadcrumb Bar */}
      <div className="flex items-center gap-1.5 px-3.5 py-1 bg-[#1e1e1e] border-b border-[#252526] text-[11px] text-[#858585] select-none">
        <span>src</span>
        <span className="text-[#555555]">›</span>
        <FileTabIcon filename={activeFile.name} language={activeFile.language} size="sm" />
        <span className="text-[#cccccc] font-medium">{activeFile.name}</span>
      </div>

      {/* VS Code Editor Body (Gutter line numbers + Syntax-highlighted code) */}
      <div className="relative bg-[#1e1e1e] text-[#d4d4d4] overflow-x-auto min-h-[60px]">
        <div className="flex min-w-full">
          {/* Gutter / Line Numbers */}
          <div className="w-11 shrink-0 py-2.5 pr-3 pl-2 text-right text-[#6e7681] text-[12px] font-mono select-none border-r border-[#252526] bg-[#1e1e1e]/80 leading-relaxed">
            {Array.from({ length: displayLinesCount }).map((_, i) => (
              <div key={i} className="min-h-[1.5em] text-[#6e7681]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Area */}
          <div className="flex-1 py-2.5 px-3 min-w-0 font-mono text-[12.5px] leading-relaxed">
            <SyntaxHighlighter code={displayCode} language={activeFile.language} />
          </div>
        </div>

        {/* Collapsed fade gradient */}
        {isLong && !isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e]/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse Action if file is long */}
      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-1.5 px-3 text-[11px] font-mono text-[#007acc] hover:text-[#3794ff] bg-[#181818] hover:bg-[#202020] border-t border-[#252526] flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show less ({lineCount} lines)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Expand full file ({lineCount} lines)</span>
            </>
          )}
        </button>
      )}

      {/* VS Code Signature Blue Status Bar */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-[#007acc] text-white text-[10.5px] font-mono select-none">
        {/* Left Status items */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FolderGit2 className="w-3 h-3" />
            <span>main*</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>⊗ 0</span>
            <span>⚠ 0</span>
          </div>
          <span className="hidden sm:inline">
            Ln {lineCount}, Col 1
          </span>
        </div>

        {/* Right Status items */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Spaces: 2</span>
          <span>UTF-8</span>
          <span className="hidden sm:inline">LF</span>
          <span className="font-semibold uppercase tracking-wider bg-black/20 px-1.5 py-0.2 rounded">
            {fileMeta.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetBlock;
