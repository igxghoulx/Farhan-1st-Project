import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, zero-dependency Markdown renderer for TrustLens AI.
 * Converts raw Markdown tokens like **text**, *text*, bullet points, and headers
 * into beautiful styled HTML elements, eliminating raw **asterisks** from the UI.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split content into lines for block processing
  const lines = content.split('\n');

  const renderedBlocks: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let listKey = 0;

  const flushList = () => {
    if (currentListItems.length > 0) {
      renderedBlocks.push(
        <ul key={`list-${listKey++}`} className="space-y-1.5 my-2 pl-4 list-disc text-slate-300">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  const renderInline = (text: string): React.ReactNode[] => {
    // Regex to match **bold**, *italic*, `code`, and plain text
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={idx} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={idx} className="italic text-slate-200">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={idx} className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-cyan-300 border border-slate-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Check for bullet list item: * or -
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const itemText = trimmed.replace(/^(\*|-)\s+/, '');
      currentListItems.push(
        <li key={`item-${lineIdx}`} className="leading-relaxed">
          {renderInline(itemText)}
        </li>
      );
      return;
    }

    // Check for numbered list: e.g. 1. or 2.
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      flushList();
      renderedBlocks.push(
        <div key={`num-${lineIdx}`} className="flex items-start gap-2 my-1 leading-relaxed text-slate-300">
          <span className="font-semibold text-cyan-400 shrink-0">{numberedMatch[1]}.</span>
          <div className="flex-1">{renderInline(numberedMatch[2])}</div>
        </div>
      );
      return;
    }

    // Normal non-list line: flush any pending list
    flushList();

    if (!trimmed) {
      // Empty line / paragraph break
      renderedBlocks.push(<div key={`empty-${lineIdx}`} className="h-2" />);
      return;
    }

    // Check for Markdown headers: #, ##, ###
    if (trimmed.startsWith('### ')) {
      renderedBlocks.push(
        <h4 key={`h4-${lineIdx}`} className="text-sm font-bold text-white mt-3 mb-1.5">
          {renderInline(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      renderedBlocks.push(
        <h3 key={`h3-${lineIdx}`} className="text-base font-bold text-white mt-3.5 mb-2">
          {renderInline(trimmed.replace(/^#+\s+/, ''))}
        </h3>
      );
      return;
    }

    // Regular paragraph line
    renderedBlocks.push(
      <p key={`p-${lineIdx}`} className="leading-relaxed text-slate-300">
        {renderInline(line)}
      </p>
    );
  });

  // Flush remaining list
  flushList();

  return <div className={`space-y-1 ${className}`}>{renderedBlocks}</div>;
};

/**
 * Helper function to completely strip Markdown asterisks and symbols if plain text is required.
 */
export function stripMarkdownAsterisks(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // remove **bold**
    .replace(/\*([^*]+)\*/g, '$1')     // remove *italic*
    .replace(/`([^`]+)`/g, '$1');      // remove `code`
}
