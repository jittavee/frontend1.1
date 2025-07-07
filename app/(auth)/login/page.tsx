// client/app/(auth)/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react'; // 1. Import useState

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null); // 2. สร้าง state สำหรับเก็บข้อความ Error
  const [isSubmitting, setIsSubmitting] = useState(false); // (Optional) State สำหรับปิดปุ่มตอนกำลังโหลด

  const onSubmit = async (data: any) => {
    setLoginError(null); // 3. เคลียร์ Error เก่าทุกครั้งที่กด Submit
    setIsSubmitting(true); // (Optional) เริ่มการโหลด

    try {
      const response = await api.post('/auth/login', data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // router.push('/profile'); // ไม่ใช้ push ทันที
      // ใช้ window.location.href เพื่อบังคับให้โหลดหน้าใหม่ทั้งหมด
      // จะทำให้ Navbar และส่วนอื่นๆ ที่ใช้ localStorage อัปเดตตัวเอง 100%
      window.location.href = '/profile';
      
    } catch (error: any) {
      // 4. ดักจับ Error และตั้งค่าข้อความใน state
      // error.response.data.message คือข้อความที่เราส่งมาจาก Backend
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setLoginError(errorMessage);
      
    } finally {
        setIsSubmitting(false); // (Optional) สิ้นสุดการโหลด
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-5 text-center">Login</h1>
      
      {/* 5. แสดงกล่องข้อความ Error ถ้ามี */}
      {loginError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
          <span className="block sm:inline">{loginError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-gray-700">Email</label>
          <input 
            type="email" 
            {...register('email', { required: 'Email is required' })} 
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{String(errors.email.message)}</p>}
        </div>
        <div>
          <label className="block text-gray-700">Password</label>
          <input 
            type="password" 
            {...register('password', { required: 'Password is required' })} 
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
           {errors.password && <p className="text-red-500 text-sm mt-1">{String(errors.password.message)}</p>}
        </div>
        <button 
          type="submit"
          disabled={isSubmitting} // (Optional) ปิดปุ่ม
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}