'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ghcolors } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Components } from 'react-markdown';
import { useState, useEffect } from 'react';
import MermaidDiagram from './MermaidDiagram';

interface GitHubMarkdownProps {
  children: string;
  className?: string;
}

export default function GitHubMarkdown({ children, className = '' }: GitHubMarkdownProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to create consistent IDs
  const createId = (text: string): string => {
    return String(text)
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Remove emojis
      .replace(/[^\w\s\u0E00-\u0E7F]/gi, '') // Keep only alphanumeric, spaces, and Thai characters
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const components: Components = {
    code(props) {
      const { node, inline, className, children, ...rest } = props as any;
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      // Handle Mermaid diagrams
      if (!inline && language === 'mermaid') {
        return (
          <div className="my-8">
            <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono flex items-center justify-between rounded-t-lg">
              <span>Mermaid Diagram</span>
              <button 
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                onClick={() => navigator.clipboard.writeText(String(children))}
              >
                Copy
              </button>
            </div>
            <div className="border border-gray-200 border-t-0 rounded-b-lg">
              <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
            </div>
          </div>
        );
      }
      
      return !inline && match ? (
        <div className="relative rounded-lg overflow-hidden my-6 border border-gray-200">
          <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm font-mono flex items-center justify-between">
            <span>{language}</span>
            <button 
              className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
              onClick={() => navigator.clipboard.writeText(String(children))}
            >
              Copy
            </button>
          </div>
          <SyntaxHighlighter
            style={ghcolors}
            language={language}
            PreTag="div"
            className="!m-0 !rounded-none"
            showLineNumbers={false}
            wrapLines={true}
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: '#f8f9fa',
              fontSize: '14px',
              lineHeight: '1.6',
              padding: '16px'
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono border">
          {children}
        </code>
      );
    },
    pre({ children }) {
      return <>{children}</>;
    },
    h1({ children }) {
      const id = createId(String(children));
      return (
        <h1 id={id} className="text-4xl font-bold mb-6 pb-4 border-b-2 border-gray-200 text-gray-900 mt-8 first:mt-0 scroll-mt-8">
          {children}
        </h1>
      );
    },
    h2({ children }) {
      const id = createId(String(children));
      return (
        <h2 id={id} className="text-3xl font-semibold mb-4 pb-3 border-b border-gray-200 mt-10 text-gray-900 scroll-mt-8">
          {children}
        </h2>
      );
    },
    h3({ children }) {
      const id = createId(String(children));
      return (
        <h3 id={id} className="text-2xl font-semibold mb-3 mt-8 text-gray-900 scroll-mt-8">
          {children}
        </h3>
      );
    },
    h4({ children }) {
      const id = createId(String(children));
      return (
        <h4 id={id} className="text-xl font-semibold mb-3 mt-6 text-gray-900 scroll-mt-8">
          {children}
        </h4>
      );
    },
    h5({ children }) {
      const id = createId(String(children));
      return (
        <h5 id={id} className="text-lg font-semibold mb-2 mt-5 text-gray-900 scroll-mt-8">
          {children}
        </h5>
      );
    },
    h6({ children }) {
      const id = createId(String(children));
      return (
        <h6 id={id} className="text-base font-semibold mb-2 mt-4 text-gray-600 scroll-mt-8">
          {children}
        </h6>
      );
    },
    p({ children }) {
      return <p className="mb-4 leading-relaxed text-gray-700 text-base">{children}</p>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-blue-400 pl-6 italic text-gray-600 my-6 bg-blue-50 py-4 rounded-r-lg">
          <div className="not-italic font-medium text-blue-800 mb-2">💡 Note</div>
          {children}
        </blockquote>
      );
    },
    ul({ children }) {
      return <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>;
    },
    li({ children }) {
      return <li className="text-gray-700 leading-relaxed">{children}</li>;
    },
    a({ href, children }) {
      return (
        <a 
          href={href} 
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
    table({ children }) {
      return (
        <div className="overflow-x-auto my-8 border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full border-collapse bg-white">
            {children}
          </table>
        </div>
      );
    },
    thead({ children }) {
      return <thead className="bg-gray-50">{children}</thead>;
    },
    tbody({ children }) {
      return <tbody className="divide-y divide-gray-200">{children}</tbody>;
    },
    tr({ children }) {
      return <tr className="hover:bg-gray-50 transition-colors">{children}</tr>;
    },
    th({ children }) {
      return (
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-200 bg-gray-100">
          {children}
        </th>
      );
    },
    td({ children }) {
      return <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">{children}</td>;
    },
    hr() {
      return <hr className="my-10 border-t-2 border-gray-200" />;
    },
    img({ src, alt }) {
      const srcStr = typeof src === 'string' ? src : '';
      
      // Special handling for badges
      if (srcStr.includes('shields.io') || srcStr.includes('badge')) {
        return (
          <img 
            src={srcStr} 
            alt={alt} 
            className="inline-block mx-1 my-1 align-middle"
          />
        );
      }
      
      return (
        <img 
          src={srcStr} 
          alt={alt} 
          className="max-w-full h-auto rounded-lg shadow-lg my-8 mx-auto block border border-gray-200"
        />
      );
    },
    strong({ children }) {
      return <strong className="font-semibold text-gray-900">{children}</strong>;
    },
    em({ children }) {
      return <em className="italic text-gray-700">{children}</em>;
    }
  };

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <div className="bg-white relative">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {children}
        </ReactMarkdown>
        
        {/* Scroll to top button */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
            aria-label="Scroll to top"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
