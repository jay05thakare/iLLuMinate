import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import ReactMarkdown from 'react-markdown';
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  CpuChipIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const CementGPT = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: `Hello ${user?.first_name}! I'm CementGPT, your AI assistant for cement industry sustainability. I can help you with:

• **Emission Analysis**: Understand your facility's carbon footprint
• **Process Optimization**: Suggestions for improving efficiency
• **Alternative Fuels**: Recommendations for cleaner energy sources
• **Sustainability Targets**: Help setting and achieving goals
• **Industry Benchmarks**: Compare your performance with peers
• **Regulations**: Navigate environmental compliance

What would you like to explore today?`,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [aiServiceStatus, setAiServiceStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check AI service status and initialize session
  useEffect(() => {
    const initializeAIService = async () => {
      try {
        setAiServiceStatus('checking');
        
        // Check if AI service is available
        await apiService.aiHealthCheck();
        setAiServiceStatus('available');
        
        // Create a new chat session
        const sessionResponse = await apiService.createChatSession(
          user?.id || null,
          null // Could add facility ID here if available
        );
        
        if (sessionResponse.success) {
          setSessionId(sessionResponse.data.session_id);
        }
        
        setError(null);
      } catch (error) {
        console.error('AI service initialization failed:', error);
        setAiServiceStatus('unavailable');
        setError(error.message || 'AI service is currently unavailable');
      }
    };

    initializeAIService();
  }, [user?.id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || aiServiceStatus !== 'available') return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Call the AI service
      const response = await apiService.chatWithCementGPT(currentMessage, {
        userId: user?.id,
        sessionId: sessionId,
        facilityId: null, // Could add facility context here
      });

      if (response.success) {
        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp || new Date().toISOString(),
          model: response.data.model,
          usage: response.data.usage,
          demoMode: response.data.demo_mode,
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message to CementGPT:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: messages.length + 2,
        type: 'error',
        content: `I'm sorry, I encountered an error: ${error.message}. Please try again or check if the AI service is running.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const suggestedQuestions = [
    "How can I reduce my facility's carbon footprint?",
    "What alternative fuels are best for my region?",
    "Help me set realistic emission reduction targets",
    "Compare my performance with industry benchmarks",
    "What are the latest sustainability regulations?",
  ];

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-primary-100 rounded-lg mr-3">
            <CpuChipIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">CementGPT</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">AI-powered cement industry assistant</p>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  aiServiceStatus === 'available' ? 'bg-green-500' :
                  aiServiceStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <span className={`text-xs font-medium ${
                  aiServiceStatus === 'available' ? 'text-green-600' :
                  aiServiceStatus === 'checking' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {aiServiceStatus === 'available' ? 'ONLINE' :
                   aiServiceStatus === 'checking' ? 'CONNECTING' :
                   'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages(messages.slice(0, 1));
            setError(null);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          title="Clear conversation"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                {message.type === 'user' ? (
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                ) : message.type === 'error' ? (
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  </div>
                ) : (
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <CpuChipIcon className="h-5 w-5 text-primary-600" />
                  </div>
                )}
              </div>
              <div
                className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm">
                  {message.type === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-gray">
                      <ReactMarkdown 
                        components={{
                          // Custom components for better styling
                          ul: ({children}) => <ul className="list-disc list-inside space-y-1 my-2 text-gray-900">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside space-y-1 my-2 text-gray-900">{children}</ol>,
                          li: ({children}) => <li className="leading-relaxed text-gray-900">{children}</li>,
                          p: ({children}) => <p className="mb-2 last:mb-0 text-gray-900 leading-relaxed">{children}</p>,
                          strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          em: ({children}) => <em className="italic text-gray-900">{children}</em>,
                          code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-900">{children}</code>,
                          h1: ({children}) => <h1 className="text-lg font-semibold mb-2 text-gray-900">{children}</h1>,
                          h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-gray-900">{children}</h2>,
                          h3: ({children}) => <h3 className="text-sm font-semibold mb-1 text-gray-900">{children}</h3>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700">{children}</blockquote>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
                {message.demoMode && (
                  <div className="text-xs mt-2 bg-yellow-100 border border-yellow-200 rounded px-2 py-1 text-yellow-800">
                    Demo Mode: Using sample responses
                  </div>
                )}
                <div className={`text-xs mt-2 flex items-center justify-between ${
                  message.type === 'user' ? 'text-primary-200' : 
                  message.type === 'error' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  <div className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {formatTimestamp(message.timestamp)}
                  </div>
                  {message.model && (
                    <div className="text-xs opacity-75">
                      {message.model}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <CpuChipIcon className="h-5 w-5 text-primary-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error notification */}
      {aiServiceStatus === 'unavailable' && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">
              AI service is currently unavailable. Please check if the AI microservice is running.
            </span>
          </div>
        </div>
      )}

      {/* Suggested Questions */}
      {messages.length === 1 && aiServiceStatus === 'available' && (
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors"
                disabled={aiServiceStatus !== 'available'}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              aiServiceStatus === 'available' 
                ? "Ask CementGPT about sustainability, emissions, or process optimization..."
                : aiServiceStatus === 'checking'
                ? "Connecting to AI service..."
                : "AI service unavailable"
            }
            className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            rows={2}
            disabled={isLoading || aiServiceStatus !== 'available'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading || aiServiceStatus !== 'available'}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            title={
              aiServiceStatus !== 'available' 
                ? "AI service must be online to send messages"
                : "Send message"
            }
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CementGPT;
