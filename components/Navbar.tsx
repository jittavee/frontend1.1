// client/components/Navbar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/userAuth'; // ตรวจสอบ path ให้ถูกต้อง
import { Menu, X } from 'lucide-react'; // ไอคอนสวยๆ

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, logout } = useAuth();

  // --- START: NEW CHANGES ---

  // ลิงก์ที่แสดงตลอดเวลา (สำหรับทุกคน)
  const publicLinks = [
    { href: '/', label: 'Home' },
  ];

  // ลิงก์ที่แสดงเฉพาะเมื่อล็อกอินแล้ว
  const authenticatedLinks = [
    { href: '/board', label: 'Board' }, // <-- เพิ่มลิงก์ Board ที่นี่
    { href: '/profile', label: 'Profile' },
  ];

  // --- END: NEW CHANGES ---

  const renderAuthSection = (isMobile: boolean = false) => {
    const primaryButtonClasses = isMobile
      ? 'block w-full text-left px-4 py-3 text-base text-white bg-blue-600 hover:bg-blue-700 rounded-md'
      : 'ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all';
    
    const secondaryLinkClasses = isMobile
      ? 'block w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-md'
      : 'text-gray-600 hover:text-blue-600 transition-colors duration-300';
    
    if (isLoading) {
      return <div className="w-32 h-8 bg-gray-200 rounded-md animate-pulse"></div>;
    }

    if (isAuthenticated) {
      return (
        <button
          onClick={() => {
            logout();
            setIsMenuOpen(false);
          }}
          className={secondaryLinkClasses}
        >
          Logout
        </button>
      );
    }

    return (
      <>
        <Link href="/login" className={secondaryLinkClasses} onClick={() => setIsMenuOpen(false)}>
          Login
        </Link>
        <Link href="/register" className={primaryButtonClasses} onClick={() => setIsMenuOpen(false)}>
          Register
        </Link>
      </>
    );
  };
  
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-red-500 hover:text-blue-600 transition-colors duration-300">
              I Care
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* --- START: NEW CHANGES FOR DESKTOP --- */}
            {publicLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                {link.label}
              </Link>
            ))}
            
            {!isLoading && isAuthenticated && (
              <>
                {authenticatedLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                    {link.label}
                  </Link>
                ))}
              </>
            )}
            {/* --- END: NEW CHANGES FOR DESKTOP --- */}
          </div>
          
          <div className="hidden md:flex items-center">
            {renderAuthSection()}
          </div>


          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {/* --- START: NEW CHANGES FOR MOBILE --- */}
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              >
                {link.label}
              </Link>
            ))}
            {!isLoading && isAuthenticated && (
              <>
                {authenticatedLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
            {/* --- END: NEW CHANGES FOR MOBILE --- */}
            <hr className="my-2" />
            <div className="pt-2 pb-3 space-y-1">
              {renderAuthSection(true)}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

