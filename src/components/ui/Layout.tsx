import React from 'react';

// Container Component
export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centered?: boolean;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  size = 'xl', 
  centered = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  };
  
  const centerClasses = centered ? 'mx-auto' : '';
  
  return (
    <div className={`${sizeClasses[size]} ${centerClasses} px-6 ${className}`}>
      {children}
    </div>
  );
};

// Section Component
export interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  spacing?: 'tight' | 'normal' | 'loose';
  background?: 'none' | 'light' | 'white' | 'card';
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ 
  children, 
  title,
  subtitle,
  spacing = 'normal',
  background = 'none',
  className = '' 
}) => {
  const spacingClasses = {
    tight: 'py-6',
    normal: 'py-8',
    loose: 'py-12'
  };
  
  const backgroundClasses = {
    none: '',
    light: 'bg-gray-50',
    white: 'bg-white',
    card: 'bg-white rounded-xl shadow-xl border border-gray-200'
  };
  
  const paddingClasses = background === 'card' ? 'p-8' : '';
  
  return (
    <section className={`${spacingClasses[spacing]} ${backgroundClasses[background]} ${paddingClasses} ${className}`}>
      {(title || subtitle) && (
        <div className="mb-8 text-center">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-700 text-lg">
              {subtitle}
            </p>
          )}
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        </div>
      )}
      {children}
    </section>
  );
};

// Grid Component
export interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  cols = 3, 
  gap = 'md',
  responsive = true,
  className = '' 
}) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };
  
  const colsClasses = responsive ? {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  } : {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };
  
  return (
    <div className={`grid ${colsClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Flex Component
export interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({ 
  children, 
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className = '' 
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col'
  };
  
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
  
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };
  
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };
  
  const wrapClasses = wrap ? 'flex-wrap' : '';
  
  return (
    <div className={`flex ${directionClasses[direction]} ${alignClasses[align]} ${justifyClasses[justify]} ${wrapClasses} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};
