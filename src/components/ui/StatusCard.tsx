import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { getStatusIcon } from './design-tokens';

export interface StatusCardProps {
  title: string;
  icon: string;
  status: 'connected' | 'error' | 'checking' | 'disconnected';
  message: string;
  lastCheck?: string;
  details?: any;
  onClick?: () => void;
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  icon,
  status,
  message,
  lastCheck,
  details,
  onClick,
  className = ''
}) => {
  return (
    <Card
      variant="elevated"
      size="md"
      interactive={!!onClick}
      status={status}
      onClick={onClick}
      className={className}
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <CardTitle icon={icon} size="md">
            {title}
          </CardTitle>
          <span className="text-2xl">{getStatusIcon(status)}</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm mb-3 text-gray-700 font-medium">
          {message}
        </p>
        
        {lastCheck && (
          <p className="text-xs text-gray-600 font-semibold">
            Last check: {lastCheck}
          </p>
        )}
        
        {details && (
          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
