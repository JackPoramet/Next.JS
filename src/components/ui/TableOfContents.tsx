'use client';

import { useState, useEffect, useRef } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TableOfContents({ content, isOpen, onClose }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    // Extract headings from markdown content with better regex
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      let text = match[2];
      
      // Clean up text - remove emojis, special characters, and extra spaces
      text = text
        .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // Remove emojis
        .replace(/[^\w\s\u0E00-\u0E7F]/gi, '') // Keep only alphanumeric, spaces, and Thai characters
        .trim();
      
      // Create clean ID
      const id = text.toLowerCase()
        .replace(/[^\w\s\u0E00-\u0E7F]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      if (text && id) {
        items.push({ id, text, level });
      }
    }

    setTocItems(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    // Observe all headings
    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      // Check if it's mobile viewport
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset to account for fixed header
      const offset = 100;
      const elementTop = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementTop,
        behavior: 'smooth'
      });
      
      // Close mobile menu after scroll
      onClose();
    }
  };

  if (tocItems.length === 0) return null;

  return (
    <>
      {/* TOC Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 border-r border-gray-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              📋 <span className="ml-2">Table of Contents</span>
            </h3>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-all duration-200"
              aria-label="Close Table of Contents"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {tocItems.length} sections
          </p>
        </div>

        <nav className="p-4 overflow-y-auto h-full pb-20">
          <div className="space-y-1">
            {tocItems.map((item, index) => {
              const nextItem = tocItems[index + 1];
              const isLastInSection = !nextItem || nextItem.level <= item.level;
              
              return (
                <div key={index} className={`${isLastInSection && item.level === 1 ? 'mb-3' : ''}`}>
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className={`block w-full text-left py-2 px-3 rounded-md text-sm transition-all duration-200 group ${
                      item.level === 1 
                        ? 'font-semibold text-gray-900 hover:bg-gray-100' 
                        : item.level === 2 
                        ? 'font-medium text-gray-700 hover:bg-gray-50 border-l-2 border-transparent hover:border-gray-300' 
                        : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent hover:border-gray-200'
                    } ${
                      activeId === item.id 
                        ? item.level === 1
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                          : 'bg-blue-50 text-blue-600 border-l-4 border-blue-400'
                        : ''
                    }`}
                    style={{
                      paddingLeft: `${0.75 + (item.level - 1) * 1}rem`,
                      marginLeft: item.level > 1 ? '0.5rem' : '0'
                    }}
                  >
                    <span className={`block truncate ${
                      item.level === 1 
                        ? 'text-base' 
                        : item.level === 2 
                        ? 'text-sm' 
                        : 'text-xs'
                    }`}>
                      {item.level > 1 && (
                        <span className="text-gray-400 mr-2">
                          {item.level === 2 ? '↳' : '⤷'}
                        </span>
                      )}
                      {item.text}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Overlay for mobile and desktop when open */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-transparent z-30 cursor-pointer"
          aria-hidden="true"
        />
      )}
    </>
  );
}
