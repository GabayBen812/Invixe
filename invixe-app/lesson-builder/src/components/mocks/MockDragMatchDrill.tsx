import React, { useState } from 'react';
import { DragonflyDoji, InvertedHammerNew, Doji, ShootingStar, RegularDoji, Hammer } from '@app/assets/Candels';

interface SlotSpec {
  id: string;
  drawKey?: 'hammer' | 'invertedHammerNew' | 'doji' | 'dragonflyDoji' | 'regularDoji' | 'shootingStar';
  imageSource?: any;
  labelBelow?: string;
}

interface TokenSpec {
  id: string;
  label: string;
  targetSlotId: string;
}

interface Props {
  slots: SlotSpec[];
  tokens: TokenSpec[];
  submitText?: string;
  onSubmit: (result: { numCorrect: number; total: number; mapping: Record<string, string | undefined> }) => void;
}

export default function MockDragMatchDrill({ slots, tokens, submitText = 'אישור', onSubmit }: Props) {
  const [tokenToSlot, setTokenToSlot] = useState<Record<string, string | undefined>>({});

  const getCandleForKey = (key?: SlotSpec['drawKey']) => {
    if (!key) return null;
    switch (key) {
      case 'hammer':
        return <Hammer width={34} height={120} />
      case 'invertedHammerNew':
        return <InvertedHammerNew width={34} height={120} />
      case 'doji':
        return <Doji width={40} height={110} />
      case 'dragonflyDoji':
        return <DragonflyDoji width={40} height={110} />
      case 'regularDoji':
        return <RegularDoji width={40} height={110} />
      case 'shootingStar':
        return <ShootingStar width={34} height={120} />
      default:
        return null;
    }
  };

  const handleTokenClick = (tokenId: string) => {
    // Find the next available slot or cycle through slots
    const currentSlot = tokenToSlot[tokenId];
    const availableSlots = slots.map(s => s.id);
    const currentIndex = currentSlot ? availableSlots.indexOf(currentSlot) : -1;
    const nextIndex = (currentIndex + 1) % availableSlots.length;
    const nextSlot = availableSlots[nextIndex];
    
    setTokenToSlot(prev => ({ ...prev, [tokenId]: nextSlot }));
  };

  const handleSubmit = () => {
    let numCorrect = 0;
    tokens.forEach(t => {
      if (tokenToSlot[t.id] === t.targetSlotId) numCorrect += 1;
    });
    onSubmit({ numCorrect, total: tokens.length, mapping: tokenToSlot });
  };

  const getSlotForToken = (tokenId: string) => {
    return tokenToSlot[tokenId];
  };

  const isTokenInSlot = (tokenId: string, slotId: string) => {
    return tokenToSlot[tokenId] === slotId;
  };

  return (
    <div className="w-full flex flex-col items-center px-4">
      {/* Top Row - First 2 slots */}
      <div className="w-full flex justify-around mb-3">
        {slots.slice(0, 2).map(slot => (
          <div key={slot.id} className="w-[120px] h-[160px] flex flex-col items-center justify-end">
            <div className="flex items-center justify-center mb-2">
              {getCandleForKey(slot.drawKey)}
            </div>
            <div className="w-[70px] h-4 bg-white rounded-xl"></div>
            {/* Show token if placed in this slot */}
            {tokens.map(token => (
              isTokenInSlot(token.id, slot.id) && (
                <div key={token.id} className="mt-2 bg-white rounded-2xl px-3 py-2 shadow-sm">
                  <span className="text-sm font-bold text-slate-800">{token.label}</span>
                </div>
              )
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Row - Next 2 slots */}
      <div className="w-full flex justify-around mb-4">
        {slots.slice(2, 4).map(slot => (
          <div key={slot.id} className="w-[120px] h-[160px] flex flex-col items-center justify-end">
            <div className="flex items-center justify-center mb-2">
              {getCandleForKey(slot.drawKey)}
            </div>
            <div className="w-[70px] h-4 bg-white rounded-xl"></div>
            {/* Show token if placed in this slot */}
            {tokens.map(token => (
              isTokenInSlot(token.id, slot.id) && (
                <div key={token.id} className="mt-2 bg-white rounded-2xl px-3 py-2 shadow-sm">
                  <span className="text-sm font-bold text-slate-800">{token.label}</span>
                </div>
              )
            ))}
          </div>
        ))}
      </div>

      {/* Tokens Row */}
      <div className="w-full flex flex-wrap justify-center gap-2 mb-6">
        {tokens.map(token => {
          const isPlaced = tokenToSlot[token.id];
          return (
            <button
              key={token.id}
              onClick={() => handleTokenClick(token.id)}
              className={`bg-white rounded-2xl px-4 py-2 shadow-sm transition-all ${
                isPlaced 
                  ? 'ring-2 ring-blue-400 bg-blue-50' 
                  : 'hover:bg-slate-50 hover:shadow-md'
              }`}
            >
              <span className="text-sm font-bold text-slate-800">{token.label}</span>
              {isPlaced && (
                <div className="text-xs text-blue-600 mt-1">
                  → Slot {slots.findIndex(s => s.id === isPlaced) + 1}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="bg-[#3F9FFF] rounded-2xl px-7 py-3 text-lg font-extrabold text-white shadow-sm hover:bg-blue-600 transition-colors"
      >
        {submitText}
      </button>
    </div>
  );
}
