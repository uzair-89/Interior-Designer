
import React, { useState, useRef, useEffect } from 'react';

interface ImageComparisonSliderProps {
  beforeImage: string;
  beforeImageType: string;
  afterImage: string;
  afterImageType: string;
}

const SliderHandleIcon: React.FC = () => (
    <svg className="w-6 h-6 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
);

const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  beforeImageType,
  afterImage,
  afterImageType,
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPos(percent);
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1) return;
    handleMove(e.clientX);
  };
  
  return (
    <div 
        ref={containerRef}
        className="comparison-slider"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
    >
      <img
        src={`data:${beforeImageType};base64,${beforeImage}`}
        alt="Before"
        className="before-image"
      />
      <img
        src={`data:${afterImageType};base64,${afterImage}`}
        alt="After"
        className="after-image"
        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
      />
      <div className="slider-line" style={{ left: `${sliderPos}%` }}>
        <div className="slider-handle">
            <SliderHandleIcon />
        </div>
      </div>
    </div>
  );
};

export default ImageComparisonSlider;
