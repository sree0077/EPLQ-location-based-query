import { Link } from 'react-router-dom';
import { Shield, MapPin, Lock, DatabaseBackup } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';

const HomePage = () => {
  const { state } = useAuth();
  const { isAuthenticated, user } = state;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 pt-32 pb-20 px-6 sm:px-10 md:px-16 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Efficient Privacy-Preserving Location-Based Queries
              </h1>
              <p className="text-lg md:text-xl mb-8 text-primary-100">
                Secure your location data with advanced encryption while still enabling powerful geospatial searches.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white transition-colors"
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white transition-colors"
                    >
                      <Shield className="h-5 w-5 mr-2" />
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-6 py-3 border border-white rounded-md text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-700 focus:ring-white transition-colors"
                    >
                      <Lock className="h-5 w-5 mr-2" />
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg p-6 shadow-xl">
                <div className="flex justify-center p-4">
                  <Lock className="h-16 w-16 text-white" />
                </div>
                <div className="border border-primary-300 border-opacity-30 rounded-md p-4 mb-4">
                  <h3 className="text-lg font-semibold mb-2">Location Data</h3>
                  <div className="bg-primary-900 bg-opacity-30 p-3 rounded text-sm font-mono mb-2">
                    <p>Lat: 37.7749 × Long: -122.4194</p>
                  </div>
                  <div className="text-center text-primary-200 text-sm">
                    <span>↓ Encrypted with predicate-only encryption ↓</span>
                  </div>
                  <div className="bg-primary-900 bg-opacity-30 p-3 rounded text-sm font-mono mt-2 break-all">
                    <p>c4f8b1e9a2d7...</p>
                  </div>
                </div>
                <div className="text-center text-xs text-primary-200">
                  <p>Secure, private, and efficient location-based queries</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 px-6 sm:px-10 md:px-16 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="p-3 rounded-full bg-primary-100 inline-block mb-4">
                <Lock className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Client-Side Encryption</h3>
              <p className="text-gray-600">
                All sensitive location data is encrypted on your device before being sent to the server, ensuring your privacy.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="p-3 rounded-full bg-secondary-100 inline-block mb-4">
                <MapPin className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Encrypted Range Queries</h3>
              <p className="text-gray-600">
                Search for points of interest within a specific radius without revealing your exact location.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="p-3 rounded-full bg-accent-100 inline-block mb-4">
                <DatabaseBackup className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Secure Storage</h3>
              <p className="text-gray-600">
                POI coordinates are encrypted at rest in the database, protecting sensitive location data even in case of a breach.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-16 px-6 sm:px-10 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Input Location</h3>
              <p className="text-sm text-gray-600">
                Users input their location or search area through a secure interface.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Client-Side Encryption</h3>
              <p className="text-sm text-gray-600">
                Search parameters are encrypted using predicate-only encryption before transmission.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Server Processing</h3>
              <p className="text-sm text-gray-600">
                The server processes encrypted queries against encrypted database without decryption.
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-primary-100 text-primary-600 font-bold text-xl mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">Secure Results</h3>
              <p className="text-sm text-gray-600">
                Encrypted results are returned and decrypted locally on the user's device.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gray-900 py-16 px-6 sm:px-10 md:px-16 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to protect your location data?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Start using EPLQ today for secure, private location-based services.
          </p>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-gray-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-colors"
            >
              <MapPin className="h-5 w-5 mr-2 text-primary-600" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-gray-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-colors"
            >
              <Shield className="h-5 w-5 mr-2 text-primary-600" />
              Get Started
            </Link>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 py-8 px-6 sm:px-10 md:px-16 text-gray-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-primary-500 mr-2" />
                <span className="text-xl font-bold text-white">EPLQ</span>
              </div>
              <p className="text-sm mt-2">Efficient Privacy-Preserving Location-Based Query</p>
            </div>
            
            <div className="text-sm">
              <p>&copy; {new Date().getFullYear()} EPLQ. All rights reserved.</p>
              <p>Privacy-first location services</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;