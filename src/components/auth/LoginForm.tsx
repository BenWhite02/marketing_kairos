// src/components/auth/LoginForm.tsx
// Cinematic Login Form with Enhanced UX + COMPREHENSIVE DEBUG STATEMENTS

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLogin } from '@/hooks/auth/useLogin';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  console.log('🔄 LoginForm: Component rendered/re-rendered');
  
  const [showPassword, setShowPassword] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(true); // Development mode
  
  const { login, isLoading, error } = useLogin();
  
  // Debug login hook state
  console.log('🔄 LoginForm: Hook state', { 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message || 'No error'
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: 'admin@kairos.dev',
      password: 'admin123',
    },
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Debug form state
  console.log('🔄 LoginForm: Form state', {
    isValid,
    hasErrors: Object.keys(errors).length > 0,
    errors: Object.keys(errors),
    watchedEmail,
    bypassAuth
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('🔄 LoginForm: ===== FORM SUBMISSION STARTED =====');
    console.log('🔄 LoginForm: Form data', { 
      email: data.email, 
      passwordLength: data.password?.length || 0,
      bypassAuth,
      isValid 
    });
    
    // Check if already loading
    if (isLoading) {
      console.warn('⚠️ LoginForm: Already loading, ignoring duplicate submission');
      return;
    }

    const submissionStartTime = Date.now();
    console.log('🔄 LoginForm: Submission started at', new Date().toISOString());

    try {
      console.log('🔄 LoginForm: About to call login function...');
      console.log('🔄 LoginForm: Login function type:', typeof login);
      
      // Add timeout wrapper for debugging
      const loginPromise = login(data, bypassAuth);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout after 30 seconds')), 30000);
      });

      console.log('🔄 LoginForm: Calling login with 30s timeout...');
      await Promise.race([loginPromise, timeoutPromise]);
      
      const submissionDuration = Date.now() - submissionStartTime;
      console.log(`✅ LoginForm: Login completed successfully in ${submissionDuration}ms`);
      console.log('✅ LoginForm: ===== FORM SUBMISSION COMPLETED =====');
      
    } catch (error) {
      const submissionDuration = Date.now() - submissionStartTime;
      console.error(`❌ LoginForm: Login failed after ${submissionDuration}ms`);
      console.error('❌ LoginForm: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      console.error('❌ LoginForm: ===== FORM SUBMISSION FAILED =====');
    }
  };

  // Debug component lifecycle
  React.useEffect(() => {
    console.log('🔄 LoginForm: Component mounted');
    return () => {
      console.log('🔄 LoginForm: Component will unmount');
    };
  }, []);

  // Debug loading state changes
  React.useEffect(() => {
    console.log(`🔄 LoginForm: Loading state changed to ${isLoading}`);
    if (isLoading) {
      console.log('🔄 LoginForm: Component is now in loading state');
    } else {
      console.log('🔄 LoginForm: Component is no longer loading');
    }
  }, [isLoading]);

  // Debug error state changes
  React.useEffect(() => {
    if (error) {
      console.error('❌ LoginForm: Error state changed:', error);
    } else {
      console.log('✅ LoginForm: Error state cleared');
    }
  }, [error]);

  // Debug bypass auth changes
  const handleBypassAuthChange = (checked: boolean) => {
    console.log(`🔄 LoginForm: Bypass auth changed to ${checked}`);
    setBypassAuth(checked);
  };

  // Debug password visibility toggle
  const handlePasswordToggle = () => {
    console.log(`🔄 LoginForm: Password visibility toggled to ${!showPassword}`);
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-6">
      {/* Development Mode Toggle */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-3"
        >
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={bypassAuth}
              onChange={(e) => handleBypassAuthChange(e.target.checked)}
              className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-sm text-amber-800 font-medium">
              Bypass Authentication (Dev Mode)
            </span>
          </label>
          
          {/* Debug Info Panel */}
          <div className="mt-2 text-xs text-amber-700 font-mono">
            <div>Loading: {isLoading ? 'YES' : 'NO'}</div>
            <div>Valid: {isValid ? 'YES' : 'NO'}</div>
            <div>Bypass: {bypassAuth ? 'YES' : 'NO'}</div>
            <div>Environment: {process.env.NODE_ENV}</div>
            <div>API URL: {import.meta.env.VITE_HADES_API_URL || 'NOT SET'}</div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Failed
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                
                {/* Debug error details in development */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">Debug Details</summary>
                    <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                      {JSON.stringify(error, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className={`
                block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all duration-200 ease-in-out
                ${errors.email 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${watchedEmail && !errors.email ? 'border-green-300' : ''}
              `}
              placeholder="Enter your email"
            />
            {/* Success Indicator */}
            {watchedEmail && !errors.email && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-2 text-sm text-red-600"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockClosedIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`
                block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                transition-all duration-200 ease-in-out
                ${errors.password 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 hover:border-gray-400'
                }
                ${watchedPassword && !errors.password ? 'border-green-300' : ''}
              `}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={handlePasswordToggle}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-2 text-sm text-red-600"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
          >
            Forgot password?
          </motion.a>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          type="submit"
          disabled={isLoading || (!bypassAuth && !isValid)}
          className={`
            w-full flex justify-center items-center py-3 px-4 border border-transparent 
            rounded-lg shadow-sm text-sm font-medium text-white 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            transition-all duration-200 ease-in-out
            ${isLoading || (!bypassAuth && !isValid)
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 active:from-blue-800 active:to-cyan-800'
            }
          `}
          onClick={() => console.log('🔄 LoginForm: Submit button clicked')}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign in to Kairos'
          )}
        </motion.button>

        {/* Debug Submit Button State */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 font-mono">
            <div>Button disabled: {isLoading || (!bypassAuth && !isValid) ? 'YES' : 'NO'}</div>
            <div>Reason: {
              isLoading ? 'Loading' : 
              (!bypassAuth && !isValid) ? 'Form invalid' : 
              'Ready to submit'
            }</div>
          </div>
        )}

        {/* Additional Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Contact your administrator
            </motion.a>
          </p>
        </motion.div>
      </form>
    </div>
  );
};

export default LoginForm;