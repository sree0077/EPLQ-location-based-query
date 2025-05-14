import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center px-6 py-32 text-center">
        <div className="bg-error-100 p-4 rounded-full inline-block mb-6">
          <Shield className="h-16 w-16 text-error-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        
        <p className="text-lg text-gray-600 max-w-md mb-8">
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;