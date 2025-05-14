import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Loader, Shield } from 'lucide-react';
import { UserRole } from '../../types';

type SignupFormInputs = {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

const SignupForm = () => {
  const { register: authRegister, state } = useAuth();
  const { error, isLoading } = state;
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormInputs>({
    defaultValues: {
      role: 'user',
    },
  });

  const password = watch('password', '');

  const onSubmit = async (data: SignupFormInputs) => {
    try {
      await authRegister(data.email, data.password, data.role);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the auth context
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="p-3 rounded-full bg-primary-100">
          <User className="h-8 w-8 text-primary-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Your Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              {...formRegister('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className={`block w-full pl-10 pr-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border ${
                errors.email ? 'border-error-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...formRegister('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message:
                    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                },
              })}
              className={`block w-full pl-10 pr-10 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border ${
                errors.password ? 'border-error-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="text-xs">{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              {...formRegister('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              className={`block w-full pl-10 pr-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border ${
                errors.confirmPassword ? 'border-error-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="role"
              {...formRegister('role', { required: 'Please select a role' })}
              className="block w-full pl-10 pr-3 py-2 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm border border-gray-300"
            >
              <option value="user">Regular User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          {errors.role && (
            <p className="mt-1 text-sm text-error-600">{errors.role.message}</p>
          )}
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <Loader className="h-5 w-5 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;