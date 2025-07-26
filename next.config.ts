import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ปิด dev indicators เพื่อลด warnings
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  
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
  }
};


export default nextConfig;
