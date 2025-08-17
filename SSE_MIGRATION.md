# Migration from WebSocket to Server-Sent Events (SSE)

This document outlines the migration from WebSocket to Server-Sent Events (SSE) for the IoT Energy Management Dashboard.

## Changes Made

### 1. New Files Created

- `src/types/sse.ts` - Type definitions for SSE messages and configurations
- `src/lib/sse-service.ts` - Core SSE service functions
- `src/hooks/useSSE.ts` - React hook for SSE connections
- `src/app/api/sse/route.ts` - SSE endpoint for real-time data streaming
- `src/app/api/sse-status/route.ts` - SSE status monitoring endpoint

### 2. Modified Files

- `src/lib/mqtt-service.ts` - Updated to use `broadcastToSSE` instead of `broadcastToWebSocket`
- `src/components/dashboard/RealtimeDashboard.tsx` - Rewritten to use SSE hook instead of WebSocket
- `src/app/api/start-services/route.ts` - Updated to report SSE status instead of WebSocket

### 3. Backup Files

- `src/components/dashboard/RealtimeDashboard_WebSocket_Backup.tsx` - Backup of original WebSocket implementation

## Advantages of SSE over WebSocket

1. **Simpler Implementation**: SSE is simpler to implement and doesn't require special WebSocket handling
2. **Better Error Handling**: Built-in reconnection mechanisms in browsers
3. **Firewall Friendly**: Works over standard HTTP/HTTPS
4. **Lower Overhead**: Less connection overhead compared to WebSocket for one-way data streaming
5. **Built-in Reconnection**: Browsers automatically reconnect SSE connections when lost

## API Endpoints

### SSE Endpoint
- **URL**: `/api/sse`
- **Method**: GET
- **Response**: Stream of Server-Sent Events with IoT data

### SSE Status
- **URL**: `/api/sse-status`
- **Method**: GET
- **Response**: JSON with SSE connection statistics

## Usage

The new SSE implementation is drop-in replacement for the WebSocket version. The dashboard will:

1. Automatically connect to the SSE endpoint
2. Receive real-time IoT data from MQTT broker
3. Display connection status and statistics
4. Handle reconnections automatically

## Migration Notes

- No changes needed to MQTT configuration
- Client connections are now managed through SSE instead of WebSocket port 8080
- All data flow remains the same: MQTT → SSE → Frontend
- Better compatibility with proxies and firewalls

## Testing

To test the new SSE implementation:

1. Start the application: `npm run dev`
2. Navigate to `/realtime` page
3. Check browser Network tab for EventSource connections
4. Verify MQTT data is received through SSE stream

## Rollback Plan

If rollback is needed:
1. Restore `RealtimeDashboard_WebSocket_Backup.tsx` to `RealtimeDashboard.tsx`
2. Revert changes in `mqtt-service.ts` and `start-services/route.ts`
3. Remove SSE-related files
