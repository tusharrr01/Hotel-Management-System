import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

/**
 * 403 Forbidden Page
 * 
 * Displayed when user doesn't have permission to access a resource
 */
const Forbidden: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle size={64} className="text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>
        <p className="text-xl text-gray-600 mb-4">403 Forbidden</p>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this resource. If you believe this
          is an error, please contact the administrator.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            to="/sign-in"
            className="block w-full px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Sign In with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
