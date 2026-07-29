import React from 'react';
import { useCharacterStore } from '../../stores/characterStore';

interface PetDisplayProps {
  size?: number;
}

export const PetDisplay: React.FC<PetDisplayProps> = ({ size = 200 }) => {
  const { currentCharacter, currentEmotion } = useCharacterStore();

  if (!currentCharacter) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400">未选择角色</span>
      </div>
    );
  }

  const expression =
    currentCharacter.expressions.emotions[currentEmotion] ||
    currentCharacter.expressions.default;

  const animationClass = {
    none: '',
    bounce: 'animate-bounce-slow',
    shake: 'animate-pulse',
    pulse: 'animate-pulse-slow',
    fade: 'expression-fade',
  }[expression.animation || 'none'];

  return (
    <div className="relative">
      <img
        src={expression.imagePath}
        alt={`${currentCharacter.name} - ${currentEmotion}`}
        className={`object-contain transition-all duration-300 ${animationClass}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          // 图片加载失败时显示占位符
          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" x="50" text-anchor="middle" font-size="40">🐾</text></svg>';
        }}
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentCharacter.name}
      </div>
    </div>
  );
};
