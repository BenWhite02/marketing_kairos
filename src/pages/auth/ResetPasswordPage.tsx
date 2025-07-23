// src/pages/auth/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';

// Validation Schema
const resetPasswordSchema = yup.object({
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Password strength indicator
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const requirements = [
    { label: '8+ characters', test: password.length >= 8 },
    { label: 'Uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', test: /[a-z]/.test(password) },
    { label: 'Number', test: /\d/.test(password) },
    { label: 'Special character', test: /[@$!%*?&]/.test(password) }
  ];

  const strength = requirements.filter(req => req.test).length;
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['red', 'orange', 'yellow', 'blue', 'green'];

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Password strength:</span>
        <span className={`font-medium text-${strengthColors[strength - 1] || 'gray'}-600`}>
          {strengthLabels[strength - 1] || 'Enter password'}
        </span>
      </div>
      
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 w-full rounded ${
              i < strength 
                ? `bg-${strengthColors[strength - 1] || 'gray'}-500` 
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-xs">
            {req.test ? (
              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <XCircleIcon className="h-3 w-3 text-gray-300 mr-1" />
            )}
            <span className={req.test ? 'text-green-600' : 'text-gray-500'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange'
  });

  const watchedPassword = watch('password', '');

  // Validate reset token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenError('Invalid or missing reset token');
        setIsValidatingToken(false);
        return;
      }

      try {
        // Simulate token validation API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In real implementation, validate token with API
        console.log('Validating reset token:', token);
        
        // For demo, randomly simulate token validation
        const isValidToken = Math.random() > 0.1; // 90% success rate for demo
        
        if (!isValidToken) {
          setTokenError('This reset link has expired or is invalid');
        }
      } catch (error) {
        setTokenError('Unable to validate reset link');
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, call reset password API
      console.log('Resetting password with token:', token);
      console.log('New password data:', data);
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToLogin = () => {
    navigate(ROUTES.AUTH.LOGIN, { 
      state: { message: 'Password reset successful. Please sign in with your new password.' }
    });
  };

  // Loading state while validating token
  if (isValidatingToken) {
    return (
      <AuthLayout
        title="Validating Reset Link"
        subtitle="Please wait while we verify your password reset request"
      >
        <div className="max-w-md w-full flex flex-col items-center space-y-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Verifying your reset link...
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Error state for invalid token
  if (tokenError) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="This password reset link is no longer valid"
      >
        <div className="max-w-md w-full space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reset Link Expired
              </h3>
              <p className="text-sm text-gray-600">
                {tokenError}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                    Common Reasons
                  </h4>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• The link was used more than once</li>
                    <li>• The link has expired (valid for 1 hour)</li>
                    <li>• A new password reset was requested</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to={ROUTES.AUTH.FORGOT_PASSWORD}
              className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Request New Reset Link
            </Link>

            <Link
              to={ROUTES.AUTH.LOGIN}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <AuthLayout
        title="Password Reset Complete"
        subtitle="Your password has been successfully updated"
      >
        <div className="max-w-md w-full space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </motion.div>

          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Password Updated Successfully
              </h3>
              <p className="text-sm text-gray-600">
                Your password has been changed. You can now sign in with your new password.
              </p>
              {email && (
                <p className="text-sm font-medium text-gray-900 mt-2">
                  Account: {email}
                </p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-green-900 mb-1">
                    Security Tips
                  </h4>
                  <ul className="text-xs text-green-800 space-y-1">
                    <li>• Use a unique password for your Kairos account</li>
                    <li>• Enable two-factor authentication for extra security</li>
                    <li>• Keep your password safe and never share it</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleReturnToLogin}
            className="w-full"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Continue to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Form state
  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Choose a strong password for your account"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Account Info */}
        {email && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <KeyIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">
                  Resetting password for:
                </h4>
                <p className="text-sm text-blue-800 font-medium">{email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative">
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              label="New Password"
              placeholder="Enter your new password"
              error={errors.password?.message}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              }
              autoComplete="new-password"
              autoFocus
            />
            <PasswordStrength password={watchedPassword} />
          </div>

          <Input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirm New Password"
            placeholder="Confirm your new password"
            error={errors.confirmPassword?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            }
            autoComplete="new-password"
          />

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={!isValid}
          >
            <KeyIcon className="h-4 w-4 mr-2" />
            Update Password
          </Button>
        </form>

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start">
            <ShieldCheckIcon className="h-5 w-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                Security Notice
              </h4>
              <p className="text-xs text-gray-600">
                After updating your password, you'll be signed out of all devices 
                and will need to sign in again with your new password.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <Link
          to={ROUTES.AUTH.LOGIN}
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};