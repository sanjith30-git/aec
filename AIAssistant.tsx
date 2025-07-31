import React, { useState, useEffect } from 'react';
import { Bot, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AIAssistantState, Building } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface AIAssistantProps {
  state: AIAssistantState;
  onStateChange: (state: Partial<AIAssistantState>) => void;
  onDestinationRequest: (query: string) => void;
  buildings: Building[];
  isNavigating: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  state,
  onStateChange,
  onDestinationRequest,
  buildings,
  isNavigating
}) => {
  const { speak, stop, isSpeaking } = useSpeechSynthesis();
  const { startListening, stopListening, isListening } = useSpeechRecognition();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (state.currentMessage && state.isActive) {
      speak(state.currentMessage);
    }
  }, [state.currentMessage, state.isActive, speak]);

  const handleVoiceCommand = (transcript: string) => {
    const query = transcript.toLowerCase();
    
    // Check if user is asking for a specific building
    const matchedBuilding = buildings.find(building => 
      query.includes(building.name.toLowerCase()) ||
      query.includes(building.id.toLowerCase())
    );

    if (matchedBuilding) {
      onDestinationRequest(matchedBuilding.id);
      onStateChange({
        currentMessage: `Navigating to ${matchedBuilding.name}. Please follow the directions.`,
        avatar: { ...state.avatar, animation: 'pointing' }
      });
    } else if (query.includes('where') || query.includes('find') || query.includes('locate')) {
      onStateChange({
        currentMessage: "I can help you find any building on campus. Just say the name of the building you're looking for, like 'CSE Block' or 'Canteen'."
      });
    } else if (query.includes('stop') || query.includes('cancel')) {
      onStateChange({
        currentMessage: "Navigation cancelled. How else can I help you?",
        avatar: { ...state.avatar, animation: 'idle' }
      });
    } else {
      onStateChange({
        currentMessage: "I didn't understand that. You can ask me to find buildings like 'Take me to the library' or 'Where is the CSE block?'"
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(handleVoiceCommand);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stop();
    } else if (state.currentMessage) {
      speak(state.currentMessage);
    }
  };

  const getAvatarAnimation = () => {
    switch (state.avatar.animation) {
      case 'pointing':
        return 'animate-pulse';
      case 'waving':
        return 'animate-bounce';
      case 'turning':
        return 'animate-spin';
      default:
        return 'animate-pulse';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* AI Avatar */}
      <div 
        className={`absolute bottom-16 right-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${getAvatarAnimation()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Bot className="w-8 h-8 text-white" />
        {(isSpeaking || isListening) && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
        )}
      </div>

      {/* Assistant Panel */}
      {isExpanded && (
        <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <h3 className="font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Campus Navigator AI
            </h3>
            <p className="text-sm opacity-90">Your intelligent campus guide</p>
          </div>

          <div className="p-4">
            {state.currentMessage && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700">{state.currentMessage}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={toggleListening}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                {isListening ? 'Stop' : 'Listen'}
              </button>

              <button
                onClick={toggleSpeaking}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isSpeaking 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSpeaking ? 'Stop' : 'Speak'}
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>Try saying:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>"Take me to CSE Block"</li>
                <li>"Where is the canteen?"</li>
                <li>"Find the library"</li>
                <li>"Stop navigation"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};