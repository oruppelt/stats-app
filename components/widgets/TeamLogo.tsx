import Image from 'next/image'
import { useState } from 'react'

interface TeamLogoProps {
  teamName: string;
  size?: number;
  className?: string;
}

export function TeamLogo({ teamName, size = 32, className = "" }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    // Fallback to team initials with colored background
    const initials = teamName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 3)
      .toUpperCase();

    // Generate a consistent color based on team name
    const colorHash = teamName.split('').reduce((hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0);
    const hue = Math.abs(colorHash) % 360;
    
    return (
      <div 
        className={`flex items-center justify-center rounded-full text-white font-bold ${className}`}
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: `hsl(${hue}, 70%, 50%)`,
          fontSize: size * 0.4
        }}
        title={teamName}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 rounded-full animate-pulse"
          style={{ width: size, height: size }}
        />
      )}
      <Image
        src={`/logos/${teamName.trim()}.png`}
        alt={teamName}
        width={size}
        height={size}
        className={`object-contain rounded-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={false}
      />
    </div>
  );
}