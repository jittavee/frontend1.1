// // app/(auth)/register/page.tsx
// 'use client';
// import { useForm } from 'react-hook-form';
// import api from '@/lib/api';
// import { useRouter } from 'next/navigation';

// export default function RegisterPage() {
//   const { register, handleSubmit, formState: { errors }, watch } = useForm();
//   const router = useRouter();

//   const onSubmit = async (data) => {
//     try {
//       const response = await api.post('/auth/register', data);
//       alert(response.data.message);
//       router.push('/login');
//     } catch (error) {
//       alert(error.response?.data?.message || 'Registration failed');
//     }
//   };

//   const password = watch('password');

//   return (
//     <div className="max-w-md mx-auto mt-10">
//       <h1 className="text-2xl font-bold mb-5">Register</h1>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         {/* ... ใส่ input fields ทั้งหมดตามที่ออกแบบ ... */}
//         <div>
//             <label>Username</label>
//             <input {...register('username', { required: true })} className="w-full p-2 border rounded" />
//             {errors.username && <span className="text-red-500">This field is required</span>}
//         </div>
//         <div>
//             <label>Email</label>
//             <input type="email" {...register('email', { required: true })} className="w-full p-2 border rounded" />
//             {errors.email && <span className="text-red-500">This field is required</span>}
//         </div>
//         <div>
//             <label>Password</label>
//             <input type="password" {...register('password', { required: true, minLength: 6 })} className="w-full p-2 border rounded" />
//             {errors.password && <span className="text-red-500">Password must be at least 6 characters</span>}
//         </div>
//          <div>
//             <label>Confirm Password</label>
//             <input type="password" {...register('confirmPassword', { required: true, validate: value => value === password || "Passwords do not match" })} className="w-full p-2 border rounded" />
//             {errors.confirmPassword && <span className="text-red-500">{errors.confirmPassword.message}</span>}
//         </div>
//         <div>
//             <label>First Name</label>
//             <input {...register('firstName', { required: true })} className="w-full p-2 border rounded" />
//         </div>
//          <div>
//             <label>Last Name</label>
//             <input {...register('lastName', { required: true })} className="w-full p-2 border rounded" />
//         </div>
//         {/* ... เพิ่ม phone, address (optional) ... */}
//         <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Register</button>
//       </form>
//     </div>
//   );
// }

// app/(auth)/register/page.tsx
'use client';

import { useForm, FieldError } from 'react-hook-form'; // สามารถ import FieldError มาใช้ได้เพื่อความชัดเจน แต่ไม่จำเป็น
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>();
  const router = useRouter();

  const onSubmit: (data: RegisterFormData) => Promise<void> = async (data) => {
    try {
      // ไม่จำเป็นต้องส่ง confirmPassword ไปที่ API
      const { confirmPassword, ...apiData } = data;
      const response = await api.post('/auth/register', apiData);
      alert(response.data.message);
      router.push('/login');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    }
  };

  // watch a password field to use it for validation
  const password = watch('password');

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-5 text-center">Create an Account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Username</label>
          <input
            {...register('username', { required: 'Username is required.' })} // CHANGE 1: ใส่ message ที่นี่
            className="w-full p-2 border rounded"
          />
          {/* CHANGE 2: แสดง .message จาก object */}
          {errors.username && <span className="text-red-500 text-sm mt-1">{String(errors.username.message)}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required.' })} // CHANGE 1
            className="w-full p-2 border rounded"
          />
          {/* CHANGE 2 */}
          {errors.email && <span className="text-red-500 text-sm mt-1">{String(errors.email.message)}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Password is required.', // CHANGE 1
              minLength: { value: 6, message: 'Password must be at least 6 characters.' } // Best practice
            })}
            className="w-full p-2 border rounded"
          />
          {/* CHANGE 2 */}
          {errors.password && <span className="text-red-500 text-sm mt-1">{String(errors.password.message)}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password.', // CHANGE 1
              validate: value => value === password || "Passwords do not match." // validate function ถูกต้องแล้ว
            })}
            className="w-full p-2 border rounded"
          />
          {/* CHANGE 2: นี่คือจุดที่แก้ปัญหาโดยตรง */}
          {errors.confirmPassword && <span className="text-red-500 text-sm mt-1">{String(errors.confirmPassword.message)}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">First Name</label>
          <input
            {...register('firstName', { required: 'First name is required.' })} // CHANGE 1
            className="w-full p-2 border rounded"
          />
          {/* CHANGE 2 */}
          {errors.firstName && <span className="text-red-500 text-sm mt-1">{String(errors.firstName.message)}</span>}
        </div>
        <div>
          <label className="block mb-1 font-medium">Last Name</label>
          <input
            {...register('lastName', { required: 'Last name is required.' })} // CHANGE 1
            className="w-full p-2 border rounded"
          />
          {/* CHANGE 2 */}
          {errors.lastName && <span className="text-red-500 text-sm mt-1">{String(errors.lastName.message)}</span>}
        </div>

        {/* --- Optional Fields --- */}
        <div>
          <label className="block mb-1 font-medium">Phone Number (Optional)</label>
          <input {...register('phone')} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Address (Optional)</label>
          <textarea {...register('address')} className="w-full p-2 border rounded" />
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Register</button>
      </form>
    </div>
  );
}