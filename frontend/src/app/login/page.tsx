'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import apiClient from '@/lib/apiClient';

/**
 * Login Page for Starry VietNam Price Management System.
 * Authenticates against backend API using BCrypt-hashed credentials.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      message.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      // Call backend auth API — password verified against BCrypt hash in DB
      const response = await apiClient.post('/auth/login', { email, password });
      const { data: userData } = response.data;

      // Store authenticated user data
      const userJson = JSON.stringify(userData);
      if (rememberMe) {
        localStorage.setItem('auth_user', userJson);
      } else {
        sessionStorage.setItem('auth_user', userJson);
      }

      message.success(`Welcome, ${userData.fullName}!`);
      router.push('/items');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      message.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center font-body-lg text-body-lg text-on-background">
      <main className="w-full max-w-md px-md">
        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-xl shadow-[0_6px_16px_0_rgba(0,0,0,0.08)]">
          {/* Header */}
          <div className="text-center mb-xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-container text-on-primary-container mb-md">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                insights
              </span>
            </div>
            <h1 className="font-h3 text-h3 text-on-surface mb-xs">Starry VietNam</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Price Management System</p>
          </div>

          {/* Form */}
          <form className="space-y-lg" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">mail</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@starry.vn"
                  className="block w-full pl-10 pr-3 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-xs">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  className="font-label-sm text-label-sm text-primary hover:text-on-primary-fixed-variant transition-colors"
                  onClick={() => message.info('Contact your system administrator')}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2 border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded"
              />
              <label className="ml-2 block font-body-sm text-body-sm text-on-surface-variant" htmlFor="remember-me">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded text-on-primary bg-primary hover:bg-primary-fixed-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary font-label-md text-label-md transition-colors shadow-sm disabled:opacity-60"
            >
              {isLoading && (
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              )}
              Sign In
            </button>
          </form>

          {/* Footer */}
          <div className="mt-lg text-center">
            <p className="font-body-sm text-body-sm text-outline">
              Secure access restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
