import React, { useState } from 'react';

interface Choice {
  id: string;
  text: string;
  correct: boolean;
}

interface Props {
  question: string;
  imageSource: string; // Image source key or URL
  choices: Choice[];
  submitText?: string;
  onSubmit: (result: { correct: boolean; selectedChoiceId: string }) => void;
}

export default function MockQuestionWithImage({ 
  question, 
  imageSource, 
  choices, 
  submitText = 'בדוק', 
  onSubmit 
}: Props) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedChoice) {
      const selectedChoiceData = choices.find(c => c.id === selectedChoice);
      onSubmit({ 
        correct: selectedChoiceData?.correct || false, 
        selectedChoiceId: selectedChoice 
      });
    }
  };


  return (
    <div className="flex-1 px-3 py-2 max-h-full overflow-hidden">
      {/* Question Text */}
      <div className="mb-3">
        <div className="bg-white rounded-2xl px-3 py-2 shadow-sm">
          <div className="text-sm font-semibold text-slate-800 text-center leading-5">
            {question}
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="mb-4">
        <div className="bg-slate-800 rounded-xl p-2 shadow-sm">
          <div className="w-full h-32 bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-white text-sm font-bold mb-1">📈 AAPL</div>
              <div className="w-24 h-12 bg-slate-700 rounded flex items-center justify-center">
                <div className="text-white text-xs">Chart</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Choices */}
      <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => setSelectedChoice(choice.id)}
            className={`w-full bg-white rounded-xl py-2 px-3 text-left transition-all ${
              selectedChoice === choice.id
                ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
                : 'border-2 border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className={`text-xs font-medium leading-4 ${
              selectedChoice === choice.id ? 'text-blue-700' : 'text-slate-700'
            }`}>
              {choice.text}
            </div>
          </button>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedChoice}
        className={`w-full rounded-2xl py-2 px-4 text-sm font-extrabold transition-colors ${
          selectedChoice
            ? 'bg-[#3F9FFF] text-white shadow-sm hover:bg-blue-600'
            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
        }`}
      >
        {submitText}
      </button>
    </div>
  );
}
