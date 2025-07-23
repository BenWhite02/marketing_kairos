// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';

// Validation Schema
const forgotPasswordSchema = yup.object({
  email: yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
});

interface ForgotPasswordFormData {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, call forgot password API
      console.log('Forgot password request for:', data.email);
      
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      startResendCooldown();
    } catch (error) {
      console.error('Forgot password request failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Resending password reset email to:', submittedEmail);
      startResendCooldown();
    } catch (error) {
      console.error('Resend failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent password reset instructions to your email"
      >
        <div className="max-w-md w-full space-y-6">
          {/* Success Icon */}
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

          {/* Success Message */}
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Password Reset Email Sent
              </h3>
              <p className="text-sm text-gray-600">
                We've sent password reset instructions to:
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {submittedEmail}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Next Steps
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Check your email inbox and spam folder</li>
                    <li>• Click the reset link within 1 hour</li>
                    <li>• Follow the instructions to create a new password</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-center text-xs text-gray-600">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                <span>For security, this link expires in 1 hour</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Resend Email */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleResendEmail}
              disabled={resendCooldown > 0 || isLoading}
              className="w-full"
            >
              {resendCooldown > 0 ? (
                <>
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Resend Email
                </>
              )}
            </Button>

            {/* Back to Login */}
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Still having trouble?{' '}
              <Link 
                to="/support" 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Form State
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email address and we'll send you a link to reset your password"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-amber-900 mb-1">
                Security Notice
              </h4>
              <p className="text-xs text-amber-800">
                For your security, password reset links expire after 1 hour. 
                Make sure to check your spam folder if you don't see the email.
              </p>
            </div>
          </div>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('email')}
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            error={errors.email?.message}
            leftIcon={<EnvelopeIcon className="h-4 w-4 text-gray-400" />}
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={!isValid}
          >
            <EnvelopeIcon className="h-4 w-4 mr-2" />
            Send Reset Instructions
          </Button>
        </form>

        {/* Alternative Actions */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Remember your password?</span>
            </div>
          </div>

          <Link
            to={ROUTES.AUTH.LOGIN}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>

        {/* Help Section */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <Link 
              to={ROUTES.AUTH.REGISTER} 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Sign up for free
            </Link>
          </p>
          
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <Link 
              to="/support" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Contact our support team
            </Link>
          </p>
        </div>

        {/* Enterprise Badge */}
        <div className="flex justify-center pt-4">
          <div className="flex items-center text-xs text-gray-500">
            <ShieldCheckIcon className="h-3 w-3 mr-1" />
            <span>Enterprise-grade security & compliance</span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};