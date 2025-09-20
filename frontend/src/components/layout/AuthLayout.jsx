const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and branding */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="text-3xl font-bold text-primary-600">
              iLLuMinate
            </div>
          </div>
          <h2 className="mt-4 text-lg text-gray-600">
            Cement Industry Sustainability Management
          </h2>
        </div>
        
        {/* Auth form content */}
        <div className="mt-8 bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          {children}
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 iLLuMinate. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
