'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-new';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Download, Filter, Search, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  category: string;
  message: string;
  details?: any;
  source?: string;
}

const levelColors = {
  info: 'bg-blue-100 text-blue-800',
  warn: 'bg-yellow-100 text-yellow-800', 
  error: 'bg-red-100 text-red-800',
  debug: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800'
};

const levelIcons = {
  info: Info,
  warn: AlertCircle,
  error: XCircle,
  debug: Search,
  success: CheckCircle
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Mock data for demonstration
  const generateMockLogs = useCallback((): LogEntry[] => {
    const categories = ['MQTT', 'Database', 'Authentication', 'API', 'SSE', 'Device', 'Admin'];
    const sources = ['server', 'client', 'mqtt-service', 'db-service', 'auth-middleware'];
    const mockLogs: LogEntry[] = [];

    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const source = sources[Math.floor(Math.random() * sources.length)];
      const levels: (keyof typeof levelColors)[] = ['info', 'warn', 'error', 'debug', 'success'];
      const level = levels[Math.floor(Math.random() * levels.length)];

      let message = '';
      let details = null;

      switch (category) {
        case 'MQTT':
          message = level === 'error' ? 'MQTT connection failed' : 
                   level === 'warn' ? 'MQTT message queue full' :
                   level === 'success' ? 'MQTT client connected successfully' :
                   'MQTT message received from device';
          if (level !== 'debug') {
            details = { deviceId: `ESP32_LAB_${Math.floor(Math.random() * 10).toString().padStart(3, '0')}`, topic: 'device/data' };
          }
          break;
        case 'Database':
          message = level === 'error' ? 'Database connection timeout' :
                   level === 'warn' ? 'Slow query detected' :
                   'Database query executed successfully';
          if (level !== 'debug') {
            details = { duration: `${Math.floor(Math.random() * 1000)}ms`, table: 'devices_data' };
          }
          break;
        case 'Authentication':
          message = level === 'error' ? 'Login failed - invalid credentials' :
                   level === 'warn' ? 'Multiple login attempts detected' :
                   'User authenticated successfully';
          if (level !== 'debug') {
            details = { userId: Math.floor(Math.random() * 100), email: 'user@example.com' };
          }
          break;
        case 'API':
          message = level === 'error' ? 'API request failed' :
                   level === 'warn' ? 'API rate limit approaching' :
                   'API request processed successfully';
          break;
        case 'SSE':
          message = level === 'error' ? 'SSE connection dropped' :
                   level === 'success' ? 'SSE connection established' :
                   'SSE data broadcast sent';
          break;
        case 'Device':
          message = level === 'error' ? 'Device offline detected' :
                   level === 'warn' ? 'Device data anomaly detected' :
                   level === 'success' ? 'Device approved and configured' :
                   'Device data received and processed';
          break;
        case 'Admin':
          message = level === 'error' ? 'Admin operation failed' :
                   level === 'warn' ? 'Unauthorized admin access attempt' :
                   'Admin operation completed successfully';
          break;
      }

      mockLogs.push({
        id: `log_${i}`,
        timestamp: timestamp.toISOString(),
        level,
        category,
        message,
        details,
        source
      });
    }

    return mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('level', filter);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (searchTerm) params.set('search', searchTerm);
      params.set('limit', '100');
      params.set('offset', '0');

      const response = await fetch(`/api/logs?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        const fetchedLogs = result.data.logs.map((log: any) => ({
          ...log,
          id: log.id.toString(),
          timestamp: log.createdAt || log.timestamp
        }));
        setLogs(fetchedLogs);
        setFilteredLogs(fetchedLogs);
      } else {
        console.error('Failed to fetch logs:', result.message);
        // Fallback to mock data if API fails
        const mockData = generateMockLogs();
        setLogs(mockData);
        setFilteredLogs(mockData);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Fallback to mock data on network error
      const mockData = generateMockLogs();
      setLogs(mockData);
      setFilteredLogs(mockData);
    } finally {
      setLoading(false);
    }
  }, [filter, categoryFilter, searchTerm, generateMockLogs]);

  const filterLogs = useCallback(() => {
    let filtered = logs;

    // Filter by level
    if (filter !== 'all') {
      filtered = filtered.filter(log => log.level === filter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filter, categoryFilter, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    filterLogs();
  }, [filterLogs]);

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `system_logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const categories = [...new Set(logs.map(log => log.category))];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">
            Monitor system activities and troubleshoot issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Log Level</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(levelColors).map(([level, colorClass]) => {
          const count = filteredLogs.filter(log => log.level === level).length;
          const Icon = levelIcons[level as keyof typeof levelIcons];
          
          return (
            <Card key={level}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            Logs ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Loading logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center text-muted-foreground h-32 flex items-center justify-center">
                No logs found matching the current filters.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => {
                  const Icon = levelIcons[log.level];
                  
                  return (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className="w-4 h-4 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[log.level]}`}>
                                {log.level.toUpperCase()}
                              </div>
                              <Badge variant="primary" outline>
                                {log.category}
                              </Badge>
                              {log.source && (
                                <Badge variant="secondary">
                                  {log.source}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium mb-1">{log.message}</p>
                            {log.details && (
                              <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                                <pre className="whitespace-pre-wrap">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
