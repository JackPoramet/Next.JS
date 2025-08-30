import React from 'react';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  height?: string | number;
  maxHeight?: string | number;
  orientation?: 'vertical' | 'horizontal' | 'both';
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className = '',
  height,
  maxHeight,
  orientation = 'vertical',
  style,
  ...props
}) => {
  const getScrollClasses = () => {
    const baseClasses = 'relative';
    
    switch (orientation) {
      case 'horizontal':
        return `${baseClasses} overflow-x-auto overflow-y-hidden`;
      case 'both':
        return `${baseClasses} overflow-auto`;
      case 'vertical':
      default:
        return `${baseClasses} overflow-y-auto overflow-x-hidden`;
    }
  };

  const scrollbarStyles = `
    scrollbar-thin 
    scrollbar-track-gray-100 
    scrollbar-thumb-gray-300 
    hover:scrollbar-thumb-gray-400
    scrollbar-thumb-rounded-full
    scrollbar-track-rounded-full
  `;

  const combinedStyle = {
    height: height,
    maxHeight: maxHeight,
    ...style,
  };

  return (
    <div
      className={`${getScrollClasses()} ${scrollbarStyles} ${className}`}
      style={combinedStyle}
      {...props}
    >
      {children}
    </div>
  );
};

// ScrollArea Viewport component for more complex layouts
export interface ScrollAreaViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ScrollAreaViewport: React.FC<ScrollAreaViewportProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`h-full w-full ${className}`} {...props}>
      {children}
    </div>
  );
};

// ScrollArea Scrollbar component (optional, for custom styling)
export interface ScrollAreaScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const ScrollAreaScrollbar: React.FC<ScrollAreaScrollbarProps> = ({
  orientation = 'vertical',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        ${orientation === 'vertical' 
          ? 'absolute right-0 top-0 bottom-0 w-2 bg-gray-100 rounded-full' 
          : 'absolute bottom-0 left-0 right-0 h-2 bg-gray-100 rounded-full'
        } 
        ${className}
      `}
      {...props}
    />
  );
};

export default ScrollArea;
