import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignupForm from '../components/auth/SignupForm';
import Navbar from '../components/layout/Navbar';

const SignupPage = () => {
  const { state } = useAuth();
  const { isAuthenticated } = state;
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center px-6 py-32 md:py-24">
        <div className="max-w-md w-full">
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;