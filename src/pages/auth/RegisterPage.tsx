// src/pages/auth/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  UserPlusIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes';

// Validation Schema
const registerSchema = yup.object({
  firstName: yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  companyName: yup.string()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters'),
  jobTitle: yup.string()
    .required('Job title is required')
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title must be less than 100 characters'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  acceptTerms: yup.boolean()
    .oneOf([true], 'You must accept the Terms of Service'),
  acceptPrivacy: yup.boolean()
    .oneOf([true], 'You must accept the Privacy Policy')
});

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  jobTitle: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
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

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange'
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, call registration API
      console.log('Registration data:', data);
      
      // Navigate to email verification page
      navigate(ROUTES.AUTH.VERIFY_EMAIL, { 
        state: { email: data.email, fromRegistration: true }
      });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: UserIcon },
    { number: 2, title: 'Company Details', icon: BuildingOfficeIcon },
    { number: 3, title: 'Security', icon: ShieldCheckIcon }
  ];

  return (
    <AuthLayout
      title="Create Your Kairos Account"
      subtitle="Join thousands of marketers delivering perfect moments"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Registration Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center mb-2">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-semibold text-blue-900">Enterprise-Grade Platform</h3>
          </div>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Real-time AI-powered decisioning</li>
            <li>• Enterprise security & compliance</li>
            <li>• 14-day free trial included</li>
          </ul>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                <step.icon className="h-4 w-4" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    {...register('firstName')}
                    label="First Name"
                    placeholder="John"
                    error={errors.firstName?.message}
                    leftIcon={<UserIcon className="h-4 w-4 text-gray-400" />}
                  />
                </div>
                <div>
                  <Input
                    {...register('lastName')}
                    label="Last Name"
                    placeholder="Doe"
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="john@company.com"
                error={errors.email?.message}
                leftIcon={<EnvelopeIcon className="h-4 w-4 text-gray-400" />}
              />

              <Button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full"
                disabled={!register('firstName').name || !register('lastName').name || !register('email').name}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2: Company Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Input
                {...register('companyName')}
                label="Company Name"
                placeholder="Acme Corporation"
                error={errors.companyName?.message}
                leftIcon={<BuildingOfficeIcon className="h-4 w-4 text-gray-400" />}
              />

              <Input
                {...register('jobTitle')}
                label="Job Title"
                placeholder="Marketing Manager"
                error={errors.jobTitle?.message}
              />

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Security */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••"
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
                />
                <PasswordStrength password={watchedPassword} />
              </div>

              <Input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="••••••••"
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
              />

              {/* Terms and Privacy */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    {...register('acceptTerms')}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>
                  </label>
                </div>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
                )}

                <div className="flex items-start">
                  <input
                    {...register('acceptPrivacy')}
                    type="checkbox"
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.acceptPrivacy && (
                  <p className="text-sm text-red-600">{errors.acceptPrivacy.message}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={isLoading}
                  disabled={!isValid}
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </motion.div>
          )}
        </form>

        {/* Alternative Actions */}
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          <Link
            to={ROUTES.AUTH.LOGIN}
            className="w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Enterprise Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="text-xs">
            <ShieldCheckIcon className="h-3 w-3 mr-1" />
            Enterprise Security & Compliance
          </Badge>
        </div>
      </div>
    </AuthLayout>
  );
};