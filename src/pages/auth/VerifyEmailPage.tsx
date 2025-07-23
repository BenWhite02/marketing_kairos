// src/pages/auth/VerifyEmailPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowLeftIcon,
  EyeIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';

type VerificationState = 'pending' | 'verifying' | 'success' | 'error' | 'expired';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [verificationState, setVerificationState] = useState<VerificationState>('pending');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  // Get email from state (registration) or search params (email link)
  const emailFromState = location.state?.email;
  const emailFromParams = searchParams.get('email');
  const email = emailFromState || emailFromParams;
  const fromRegistration = location.state?.fromRegistration;
  
  // Get verification token from URL
  const token = searchParams.get('token');

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && email) {
      verifyEmailToken(token);
    }
  }, [token, email]);

  const verifyEmailToken = async (verificationToken: string) => {
    setVerificationState('verifying');
    
    try {
      // Simulate API verification call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, call email verification API
      console.log('Verifying email with token:', verificationToken);
      console.log('Email:', email);
      
      // For demo, randomly simulate verification success/failure
      const isValid = Math.random() > 0.1; // 90% success rate for demo
      
      if (isValid) {
        setVerificationState('success');
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate(ROUTES.DASHBOARD.OVERVIEW, { 
            state: { message: 'Email verified successfully! Welcome to Kairos.' }
          });
        }, 3000);
      } else {
        setVerificationState('expired');
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      setVerificationState('error');
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

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !email) return;
    
    setIsResending(true);
    try {
      // Simulate resend API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Resending verification email to:', email);
      startResendCooldown();
    } catch (error) {
      console.error('Resend failed:', error);
    } finally {
      setIsResending(false);
    }
  };

  // Success State
  if (verificationState === 'success') {
    return (
      <AuthLayout
        title="Email Verified Successfully!"
        subtitle="Your account is now active and ready to use"
      >
        <div className="max-w-md w-full space-y-6">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center relative">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-green-200 border-t-green-500 rounded-full"
              />
            </div>
          </motion.div>

          {/* Success Message */}
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Welcome to Kairos! 🎉
              </h3>
              <p className="text-sm text-gray-600">
                Your email address has been successfully verified:
              </p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {email}
              </p>
            </div>

            {/* Welcome Benefits */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <SparklesIcon className="h-6 w-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    You're all set! Here's what's next:
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Access your personalized dashboard</li>
                    <li>• Start creating eligibility atoms</li>
                    <li>• Build your first customer moments</li>
                    <li>• Explore AI-powered decisioning</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <ClockIcon className="h-4 w-4" />
              <span>Redirecting to dashboard in 3 seconds...</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD.OVERVIEW)}
              className="w-full"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Get Started Now
            </Button>

            <Link
              to="/onboarding"
              className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Take the Tour
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Error/Expired State
  if (verificationState === 'error' || verificationState === 'expired') {
    const isExpired = verificationState === 'expired';
    
    return (
      <AuthLayout
        title={isExpired ? "Verification Link Expired" : "Verification Failed"}
        subtitle={isExpired ? "This verification link is no longer valid" : "We couldn't verify your email address"}
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
                {isExpired ? 'Link Expired' : 'Verification Failed'}
              </h3>
              <p className="text-sm text-gray-600">
                {isExpired 
                  ? 'This verification link has expired or been used already.'
                  : 'We encountered an issue while verifying your email address.'
                }
              </p>
              {email && (
                <p className="text-sm font-medium text-gray-900 mt-2">
                  Email: {email}
                </p>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                    What happened?
                  </h4>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• The verification link may have expired (valid for 24 hours)</li>
                    <li>• The link may have already been used</li>
                    <li>• There might be a temporary technical issue</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              disabled={resendCooldown > 0 || isResending || !email}
              className="w-full"
              loading={isResending}
            >
              {resendCooldown > 0 ? (
                <>
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Resend in {resendCooldown}s
                </>
              ) : (
                <>
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Send New Verification Link
                </>
              )}
            </Button>

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

  // Verifying State
  if (verificationState === 'verifying') {
    return (
      <AuthLayout
        title="Verifying Your Email"
        subtitle="Please wait while we confirm your email address"
      >
        <div className="max-w-md w-full space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center relative">
              <EnvelopeIcon className="h-8 w-8 text-blue-600" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-blue-200 border-t-blue-500 rounded-full"
              />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verifying Email...
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Pending State (waiting for user to click email link)
  return (
    <AuthLayout
      title="Check Your Email"
      subtitle="We've sent a verification link to your email address"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Email Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <EnvelopeIcon className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        {/* Instructions */}
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verify Your Email Address
            </h3>
            <p className="text-sm text-gray-600">
              We've sent a verification link to:
            </p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {email || 'your email address'}
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
                  <li>• Click the verification link in the email</li>
                  <li>• Return here to access your account</li>
                  <li>• The link expires in 24 hours</li>
                </ul>
              </div>
            </div>
          </div>

          {fromRegistration && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-green-900">
                    Registration Complete!
                  </h4>
                  <p className="text-xs text-green-800">
                    Your account has been created. Just verify your email to get started.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Resend Email */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleResendVerification}
            disabled={resendCooldown > 0 || isResending || !email}
            className="w-full"
            loading={isResending}
          >
            {resendCooldown > 0 ? (
              <>
                <ClockIcon className="h-4 w-4 mr-2" />
                Resend in {resendCooldown}s
              </>
            ) : (
              <>
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Resend Verification Email
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

        {/* Help Section */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            Not receiving emails?{' '}
            <Link 
              to="/support" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Check our troubleshooting guide
            </Link>
          </p>
          
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <Link 
              to="/support" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Contact support
            </Link>
          </p>
        </div>

        {/* Enterprise Badge */}
        <div className="flex justify-center pt-4">
          <Badge variant="secondary" className="text-xs">
            <ShieldCheckIcon className="h-3 w-3 mr-1" />
            Secure Email Verification
          </Badge>
        </div>
      </div>
    </AuthLayout>
  );
};