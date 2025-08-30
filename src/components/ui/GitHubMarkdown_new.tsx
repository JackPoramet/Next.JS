'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Components } from 'react-markdown';
import { useState, useEffect } from 'react';
import MermaidDiagram from './MermaidDiagram';

interface GitHubMarkdownProps {
  children: string;
  className?: string;
}

export default function GitHubMarkdown({ children, className = '' }: Readonly<GitHubMarkdownProps>) {
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

  // Create a slug from heading text
  const createId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/(-)+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const components: Components = {
    code({ className, children }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      // For mermaid diagrams
      if (language === 'mermaid') {
        return (
          <div className="my-4">
            <MermaidDiagram chart={String(children).replace(/\n$/, '')} />
          </div>
        );
      }
      
      // For code blocks
      if (match) {
        return (
          <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-t-lg border-b">
              <span className="text-sm text-gray-600 dark:text-gray-300">{language}</span>
              <button 
                className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                onClick={() => navigator.clipboard.writeText(String(children))}
              >
                Copy
              </button>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm font-mono">{String(children).replace(/\n$/, '')}</code>
            </pre>
          </div>
        );
      }
      
      // For inline code
      return (
        <code className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono border">
          {children}
        </code>
      );
    },

    pre({ children }) {
      return <div>{children}</div>;
    },
    
    h1({ children }) {
      const id = createId(String(children));
      return (
        <h1 id={id} className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
          {children}
        </h1>
      );
    },
    
    h2({ children }) {
      const id = createId(String(children));
      return (
        <h2 id={id} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          {children}
        </h2>
      );
    },
    
    h3({ children }) {
      const id = createId(String(children));
      return (
        <h3 id={id} className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-2">
          {children}
        </h3>
      );
    },
    
    h4({ children }) {
      const id = createId(String(children));
      return (
        <h4 id={id} className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">
          {children}
        </h4>
      );
    },
    
    h5({ children }) {
      const id = createId(String(children));
      return (
        <h5 id={id} className="text-base font-bold text-gray-900 dark:text-white mt-3 mb-2">
          {children}
        </h5>
      );
    },
    
    h6({ children }) {
      const id = createId(String(children));
      return (
        <h6 id={id} className="text-sm font-bold text-gray-900 dark:text-white mt-2 mb-1">
          {children}
        </h6>
      );
    },
    
    p({ children }) {
      return <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>;
    },
    
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 italic text-blue-800 dark:text-blue-200">
          {children}
        </blockquote>
      );
    },
    
    ul({ children }) {
      return <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">{children}</ul>;
    },
    
    ol({ children }) {
      return <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">{children}</ol>;
    },
    
    li({ children }) {
      return <li className="mb-1">{children}</li>;
    },
    
    a({ href, children }) {
      return (
        <a 
          href={href} 
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    },
    
    img({ src, alt }) {
      return (
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full h-auto rounded-lg shadow-lg my-4 border border-gray-200 dark:border-gray-700" 
        />
      );
    },
    
    table({ children }) {
      return (
        <div className="overflow-x-auto my-4">
          <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
            {children}
          </table>
        </div>
      );
    },
    
    thead({ children }) {
      return <thead className="bg-gray-50 dark:bg-gray-700">{children}</thead>;
    },
    
    tbody({ children }) {
      return <tbody>{children}</tbody>;
    },
    
    tr({ children }) {
      return <tr className="border-b border-gray-200 dark:border-gray-600">{children}</tr>;
    },
    
    th({ children }) {
      return <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-medium text-gray-900 dark:text-white">{children}</th>;
    },
    
    td({ children }) {
      return <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300">{children}</td>;
    },
    
    hr() {
      return <hr className="my-8 border-gray-300 dark:border-gray-600" />;
    },
    
    strong({ children }) {
      return <strong className="font-bold text-gray-900 dark:text-white">{children}</strong>;
    },
    
    em({ children }) {
      return <em className="italic text-gray-800 dark:text-gray-200">{children}</em>;
    }
  };

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {children}
      </ReactMarkdown>
      
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </div>
  );
}
