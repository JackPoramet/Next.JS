'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

export default function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const diagramId = id || `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  useEffect(() => {
    // Initialize Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      fontSize: 16,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
        padding: 20
      },
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
        boxTextMargin: 5,
        noteMargin: 10,
        messageMargin: 35
      },
      gantt: {
        useMaxWidth: true,
        leftPadding: 75,
        rightPadding: 20,
        topPadding: 50
      },
      gitGraph: {
        useMaxWidth: true,
        showBranches: true,
        showCommitLabel: true,
        mainBranchName: 'main'
      }
    });

    const renderDiagram = async () => {
      if (containerRef.current && chart) {
        try {
          setIsLoading(true);
          setError(null);
          
          // Clean the chart content
          const cleanChart = chart.trim();
          
          // Clear previous content
          containerRef.current.innerHTML = '';
          
          // Validate mermaid syntax
          const isValid = await mermaid.parse(cleanChart);
          if (!isValid) {
            throw new Error('Invalid Mermaid syntax');
          }
          
          // Render the diagram
          const { svg } = await mermaid.render(diagramId, cleanChart);
          
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            
            // Add responsive styling to the SVG
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) {
              svgElement.style.maxWidth = '100%';
              svgElement.style.height = 'auto';
              svgElement.style.display = 'block';
              svgElement.style.margin = '0 auto';
            }
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error rendering Mermaid diagram:', error);
          setError(error instanceof Error ? error.message : 'Unknown error occurred');
          setIsLoading(false);
          
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="flex items-center justify-center p-8">
                <div class="text-center">
                  <div class="text-red-500 text-lg mb-2">⚠️</div>
                  <p class="text-red-600 font-medium mb-2">Error rendering diagram</p>
                  <p class="text-gray-600 text-sm">${error instanceof Error ? error.message : 'Unknown error'}</p>
                </div>
              </div>
            `;
          }
        }
      }
    };

    renderDiagram();
  }, [chart, diagramId]);

  if (!chart?.trim()) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No diagram content provided</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg">
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600">Rendering diagram...</span>
          </div>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className={`w-full overflow-x-auto ${isLoading ? 'hidden' : ''}`}
        style={{ minHeight: isLoading ? '0' : '100px' }}
      />
      
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="text-red-500 text-lg">⚠️</div>
            <div>
              <p className="text-red-700 font-medium">Error rendering Mermaid diagram</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <details className="mt-2">
                <summary className="text-red-600 text-sm cursor-pointer hover:text-red-800">
                  Show diagram source
                </summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded border overflow-x-auto">
                  {chart}
                </pre>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
