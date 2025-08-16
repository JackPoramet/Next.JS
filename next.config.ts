import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ปิด dev indicators เพื่อลด warnings  
  devIndicators: {
    position: 'bottom-left',
  },

  // อนุญาต cross-origin requests จาก network IPs
  allowedDevOrigins: [
    '192.168.1.*',      // Wi-Fi network range
    '169.254.*.*',      // Link-local address range
    'localhost',        // Local development
  ],
  
  // ตั้งค่า hostname และ port สำหรับ development
  // สามารถเข้าถึงได้จาก network interfaces อื่นๆ
  async rewrites() {
    return []
  },

  // Headers สำหรับ development CORS
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: "/_next/:path*",
          headers: [
            {
              key: "Access-Control-Allow-Origin",
              value: "*"
            }
          ]
        },
        {
          source: "/:path*",
          headers: [
            {
              key: "Access-Control-Allow-Origin", 
              value: "*"
            }
          ]
        }
      ];
    }
    return [];
  },

  // Production optimizations
  experimental: {
    optimizePackageImports: ['react-syntax-highlighter', 'react-markdown']
  },

  // ปิด source maps ใน production เพื่อลดขนาด
  productionBrowserSourceMaps: false,
}


export default nextConfig;
