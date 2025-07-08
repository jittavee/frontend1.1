import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   // เพิ่มส่วนนี้เข้าไป
  images: {
    remotePatterns: [
      
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000', // ระบุ port ของ API ของคุณ
        pathname: '/uploads/**', // อนุญาตทุก path ที่อยู่ใต้ /uploads
      },
    ],
  },
};

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}
export default nextConfig;
