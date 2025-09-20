import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  CpuChipIcon,
  ClockIcon,
  ArrowPathIcon,
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (input) => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('emission') || lowerInput.includes('carbon')) {
      return `Based on your facility data, I can see you're interested in emissions management. Here are some insights:

**Current Performance:**
• Your facility's carbon intensity is approximately 850 kgCO2e/tonne cement
• This is slightly above the industry average of 820 kgCO2e/tonne

**Recommendations:**
1. **Increase Alternative Fuel Usage**: Currently at 15%, industry leaders achieve 25-30%
2. **Energy Efficiency**: Consider waste heat recovery systems
3. **Process Optimization**: Optimize kiln temperature profiles

Would you like me to analyze specific emission sources or provide more detailed recommendations?`;
    }
    
    if (lowerInput.includes('fuel') || lowerInput.includes('alternative')) {
      return `Great question about alternative fuels! Based on your location and facility type, here are suitable options:

**Recommended Alternative Fuels:**
1. **Biomass** - 25% emission reduction, high availability in your region
2. **Refuse Derived Fuel (RDF)** - Cost-effective, stable supply chain
3. **Used Tires** - High energy content, good economics

**Implementation Strategy:**
• Start with 5-10% substitution rate
• Gradually increase to 25-30% over 2 years
• Monitor clinker quality throughout transition

**Expected Benefits:**
• 15-20% reduction in CO2 emissions
• 10-15% reduction in fuel costs
• Improved waste management compliance

Would you like specific implementation guidance for any of these fuels?`;
    }
    
    if (lowerInput.includes('target') || lowerInput.includes('goal')) {
      return `Setting meaningful sustainability targets is crucial. Here's my analysis for your facility:

**Recommended Targets for 2030:**
1. **Carbon Intensity**: Reduce to 650 kgCO2e/tonne (25% reduction)
2. **Alternative Fuels**: Increase to 30% of total fuel mix
3. **Energy Efficiency**: Improve by 15% through heat recovery

**Pathway to Net Zero by 2050:**
• **Phase 1 (2024-2030)**: Process optimization & alternative fuels
• **Phase 2 (2030-2040)**: Carbon capture technology implementation  
• **Phase 3 (2040-2050)**: Full decarbonization with renewable energy

**Quick Wins:**
• Optimize raw material mix (limestone alternatives)
• Implement predictive maintenance for energy efficiency
• Switch to renewable electricity contracts

Would you like me to create a detailed roadmap for any of these targets?`;
    }
    
    if (lowerInput.includes('benchmark') || lowerInput.includes('compare')) {
      return `Here's how your facility compares to industry benchmarks:

**Performance Comparison:**
• **Carbon Intensity**: 850 kgCO2e/t (Industry avg: 820 kgCO2e/t) - 55th percentile
• **Energy Efficiency**: 3.2 GJ/t (Best practice: 2.8 GJ/t) - 60th percentile
• **Alternative Fuel Rate**: 15% (Industry leaders: 25-30%) - 40th percentile

**Regional Comparison:**
You rank #8 out of 15 cement plants in your region.

**Improvement Opportunities:**
1. **Top Priority**: Increase alternative fuel usage (+10 percentile points)
2. **Medium Priority**: Energy efficiency improvements (+15 percentile points)
3. **Long-term**: Carbon capture readiness

**Peer Learning:**
Similar facilities have achieved 20% emission reductions through:
• Advanced process control systems
• Waste heat recovery
• Alternative raw materials

Would you like detailed benchmarking data for any specific metric?`;
    }
    
    // Default response
    return `I understand you're asking about "${input}". As CementGPT, I'm here to help with cement industry sustainability challenges.

**I can assist with:**
• **Technical Analysis**: Process optimization, energy efficiency
• **Environmental Impact**: Emission reduction strategies, alternative fuels
• **Compliance**: Environmental regulations, reporting requirements
• **Economics**: Cost-benefit analysis of sustainability initiatives
• **Innovation**: Latest technologies and best practices

Could you provide more specific details about what you'd like to explore? For example:
- "How can I reduce my facility's carbon footprint?"
- "What alternative fuels work best for my kiln type?"
- "Help me set realistic emission reduction targets"

I'm here to provide data-driven insights tailored to your facility's needs!`;
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
            <p className="text-sm text-gray-500">AI-powered cement industry assistant</p>
          </div>
        </div>
        <button
          onClick={() => setMessages(messages.slice(0, 1))}
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
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 flex items-center ${
                  message.type === 'user' ? 'text-primary-200' : 'text-gray-500'
                }`}>
                  <ClockIcon className="h-3 w-3 mr-1" />
                  {formatTimestamp(message.timestamp)}
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

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md transition-colors"
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
            placeholder="Ask CementGPT about sustainability, emissions, or process optimization..."
            className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CementGPT;
