import { NextRequest } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Set up SSE headers
  const responseHeaders = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control, Content-Type',
  });

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    start(controller) {
      // Function to send data to client
      const sendData = async () => {
        try {
          // ดึงข้อมูลล่าสุดจากตาราง devices_data
          const result = await query(
            `SELECT d.*, dp.device_name, dp.device_id, f.faculty_name as faculty
             FROM devices_data d
             JOIN devices_prop dp ON d.device_id = dp.device_id
             LEFT JOIN locations l ON dp.location_id = l.id
             LEFT JOIN faculties f ON l.faculty_id = f.id
             ORDER BY d.last_data_received DESC`,
            []
          );

          // แปลงข้อมูลให้เหมาะสมกับการแสดงผล
          const devicesData = result.rows.map((row: any) => ({
            ...row,
            last_data_received: row.last_data_received ? new Date(row.last_data_received).toISOString() : null,
            created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
            updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null
          }));

          // จัดกลุ่มข้อมูลตามคณะ
          const devicesByFaculty: { [faculty: string]: { [deviceKey: string]: any } } = {};
          
          devicesData.forEach((device: any) => {
            const faculty = device.faculty || 'unknown';
            const deviceKey = device.device_name || device.device_id;
            
            if (!devicesByFaculty[faculty]) {
              devicesByFaculty[faculty] = {};
            }
            
            devicesByFaculty[faculty][deviceKey] = {
              energy_data: {
                voltage: device.voltage ? parseFloat(device.voltage) : null,
                current: device.current_amperage ? parseFloat(device.current_amperage) : null,
                active_power: device.active_power ? parseFloat(device.active_power) : null,
                frequency: device.frequency ? parseFloat(device.frequency) : null,
                power_factor: device.power_factor ? parseFloat(device.power_factor) : null,
                // ข้อมูลเพิ่มเติมสำหรับระบบไฟฟ้า 3 เฟส
                voltage_phase_b: device.voltage_phase_b ? parseFloat(device.voltage_phase_b) : null,
                voltage_phase_c: device.voltage_phase_c ? parseFloat(device.voltage_phase_c) : null,
                current_phase_b: device.current_phase_b ? parseFloat(device.current_phase_b) : null,
                current_phase_c: device.current_phase_c ? parseFloat(device.current_phase_c) : null,
                power_factor_phase_b: device.power_factor_phase_b ? parseFloat(device.power_factor_phase_b) : null,
                power_factor_phase_c: device.power_factor_phase_c ? parseFloat(device.power_factor_phase_c) : null,
                active_power_phase_a: device.active_power_phase_a ? parseFloat(device.active_power_phase_a) : null,
                active_power_phase_b: device.active_power_phase_b ? parseFloat(device.active_power_phase_b) : null,
                active_power_phase_c: device.active_power_phase_c ? parseFloat(device.active_power_phase_c) : null
              },
              environmental_data: {
                temperature: device.device_temperature ? parseFloat(device.device_temperature) : null
              },
              // ข้อมูลสถานะ
              network_status: device.network_status,
              connection_quality: device.connection_quality,
              signal_strength: device.signal_strength,
              // ข้อมูลเวลา
              lastUpdate: device.last_data_received,
              timestamp: device.updated_at
            };
          });

          const sseData = {
            success: true,
            message: 'Device data retrieved successfully',
            data: {
              devicesByFaculty,
              totalDevices: devicesData.length,
              timestamp: new Date().toISOString()
            }
          };

          // Send data as SSE
          const data = `data: ${JSON.stringify(sseData)}\n\n`;
          controller.enqueue(encoder.encode(data));
          
        } catch (error) {
          console.error('[SSE] Error fetching device data:', error);
          
          const errorData = {
            success: false,
            message: 'Error fetching device data',
            data: {
              devicesByFaculty: {},
              totalDevices: 0,
              timestamp: new Date().toISOString()
            }
          };

          const data = `data: ${JSON.stringify(errorData)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      };

      // Send initial data
      sendData();

      // Set up interval to send data every 3 seconds
      const interval = setInterval(sendData, 3000);

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });

      // Store interval for cleanup
      (controller as any).interval = interval;
    },

    cancel() {
      if ((this as any).interval) {
        clearInterval((this as any).interval);
      }
    }
  });

  return new Response(customReadable, {
    headers: responseHeaders,
  });
}
