import CementGPT from '../components/ai/CementGPT';
import {
  CpuChipIcon,
} from '@heroicons/react/24/outline';

const CementGPTPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600">
            <CpuChipIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cement GPT</h1>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="text-xs text-purple-600 font-medium">AI POWERED</span>
              </div>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">Your intelligent cement industry assistant</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Description */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500">
            <CpuChipIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">AI-Powered Cement Industry Expert</h3>
        </div>
        <p className="text-gray-700 mb-4">
          Get instant answers to your cement industry questions, sustainability insights, 
          process optimization guidance, and regulatory compliance information from our 
          specialized AI assistant trained on cement industry best practices.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Sustainability Guidance</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Process Optimization</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600">Industry Best Practices</span>
          </div>
        </div>
      </div>

      {/* Cement GPT Component */}
      <div>
        <CementGPT />
      </div>
    </div>
  );
};

export default CementGPTPage;
