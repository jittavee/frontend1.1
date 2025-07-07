'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// ประเภทข้อมูล User ที่คาดหวังจาก API (ต้องมี Full URL สำหรับ profileImageUrl)
interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  profileImageUrl?: string; // คาดหวังว่าจะเป็น Full URL เช่น 'http://localhost:5000/uploads/image.jpg'
  education?: string;
  experience?: string;
  skills?: string;
  friendCategories: string[];
}

// ประเภทข้อมูลสำหรับ Form
type FormInputs = Omit<UserProfile, 'id' | 'username' | 'email' | 'profileImageUrl' | 'friendCategories'> & {
  friendCategories: Record<string, boolean>;
};

// ตัวเลือกหมวดหมู่เพื่อน
const friendCategoryOptions = [
    { id: 'TRAVEL', label: 'หาเพื่อนไปเที่ยว' },
    { id: 'DINING', label: 'หาเพื่อนไปทานข้าว' },
    { id: 'ERRANDS', label: 'หาเพื่อนไปทำธุระ' },
    { id: 'DOCTOR', label: 'หาเพื่อนไปหาหมอ' },
    { id: 'SPORTS', label: 'หาเพื่อนเล่นกีฬา' },
    { id: 'SHOPPING', label: 'หาเพื่อนไปซื้อของ' },
];

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormInputs>();

  // Effect to fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const response = await api.get<UserProfile>('/users/profile');
        const userData = response.data; // userData.profileImageUrl ควรเป็น Full URL แล้ว
        setUser(userData);
        
        // Populate form with fetched data
        const { friendCategories: userCategories, ...otherUserData } = userData;
        const categoriesForForm = friendCategoryOptions.reduce((acc, option) => {
            acc[option.id] = userCategories.includes(option.id);
            return acc;
        }, {} as Record<string, boolean>);
        const formValues: FormInputs = { ...otherUserData, friendCategories: categoriesForForm };
        reset(formValues);

      } catch (error) {
        console.error('Failed to fetch profile', error);
        localStorage.clear(); // Clear all local storage on auth error
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router, reset]);

  // Handler for updating user profile info
  const onUpdateProfile: SubmitHandler<FormInputs> = async (data) => {
    setIsUpdating(true);
    try {
      const selectedCategories = Object.keys(data.friendCategories).filter(key => data.friendCategories[key]);
      const payload = { ...data, friendCategories: selectedCategories };

      const response = await api.put<{ user: UserProfile }>('/users/profile', payload);
      const updatedUser = response.data.user;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      const { friendCategories: updatedCategories, ...otherUpdatedData } = updatedUser;
      const updatedCategoriesForForm = friendCategoryOptions.reduce((acc, option) => {
        acc[option.id] = updatedCategories.includes(option.id);
        return acc;
      }, {} as Record<string, boolean>);
      reset({ ...otherUpdatedData, friendCategories: updatedCategoriesForForm });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile', error);
      alert('An error occurred while updating your profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler for file input change
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handler for uploading a new profile image
  const handleImageUpload = async () => {
    if (!selectedFile) return;
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('profileImage', selectedFile);

    try {
      const response = await api.post<{ user: UserProfile }>('/users/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = response.data.user; // API ส่ง user object ที่สมบูรณ์กลับมา

      // อัปเดต State และ localStorage ด้วยข้อมูลใหม่จาก API โดยตรง
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      alert('Profile picture uploaded!');
      setSelectedFile(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Failed to upload image', error);
      const errorMessage = (error as any).response?.data?.details || 'Upload failed.';
      alert(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Handler for logout
  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading profile...</div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-800">Your Profile</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200">
          Logout
        </button>
      </div>

      <div className="flex flex-col items-center p-6 mb-8 bg-gray-50 rounded-lg">
        <Image
          // ใช้ URL จาก State โดยตรง, ถ้าไม่มีให้ใช้ preview, ถ้าไม่มีอีกให้ใช้ default
          src={previewImage || user.profileImageUrl || '/default-avatar.png'}
          alt="Profile Picture"
          width={200}
          height={200}
          className="w-60 h-100  object-cover border-4 border-gray-200 shadow-sm"
          
          priority
        />
        <div className="mt-4">
          <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <label htmlFor="file-upload" className="cursor-pointer bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors duration-200">
            Choose Image
          </label>
          {selectedFile && (
            <button onClick={handleImageUpload} disabled={isUpdating} className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-200">
              {isUpdating ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>
        {selectedFile && <span className="text-sm text-gray-500 mt-2">{selectedFile.name}</span>}
      </div>

      <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-6">
        {/* Form fields here, same as before */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input {...register('firstName', { required: "First name is required" })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input {...register('lastName', { required: "Last name is required" })} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input {...register('phone')} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea {...register('address')} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800">Professional Info</h2>
          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Education</label>
              <textarea {...register('education')} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience</label>
              <textarea {...register('experience')} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Skills <span className="text-gray-500 font-normal">(e.g., Cooking, Guitar, Programming)</span></label>
              <input {...register('skills')} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
        </div>
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800">I'm looking for a friend to...</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {friendCategoryOptions.map(option => (
              <div key={option.id} className="flex items-center">
                <input type="checkbox" id={option.id} {...register(`friendCategories.${option.id}`)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                <label htmlFor={option.id} className="ml-2 block text-sm text-gray-900">{option.label}</label>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-5 text-right">
          <button type="submit" disabled={isUpdating || !isDirty} className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all duration-200">
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}