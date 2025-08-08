import React, { useState, useEffect } from 'react';

// The list of taglines we want to display
const taglines = [
  "A smart search for a smart choice",
  "Your dream home is found with one click",
  "Beyond a simple search; intelligent real estate analysis",
  "Let artificial intelligence be your real estate advisor",
  "Compare thousands of ads, choose the best ones",
  "Make the most important decision of your life with confidence",
  "The best data from the web, in one smart search",
  "The future of property search is in your hands today",
];

interface AnimatedTaglineProps {
  isDark: boolean;
}

export default function AnimatedTagline({ isDark }: AnimatedTaglineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // This interval just updates the index every 4 seconds
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % taglines.length);
    }, 4000); 

    return () => clearInterval(intervalId);
  }, []);

  // We need to define the height of each line for the slide effect.
  // In Tailwind, h-8 is 2rem, which works well for text-xl.
  const slideHeight = 2; // in rem units

  return (
    // 1. This is the outer container, our "viewport".
    // It has a fixed height and hides anything outside of it.
    <div style={{ height: `${slideHeight}rem` }} className="overflow-hidden">
      
      {/* 2. This is the inner container that slides up. */}
      {/* The 'transform' style is updated based on the current index. */}
      <div
        className="transition-transform duration-700 ease-in-out"
        style={{ transform: `translateY(-${currentIndex * slideHeight}rem)` }}
      >
        
        {/* 3. We render ALL taglines stacked on top of each other. */}
        {taglines.map((tagline, index) => (
          <p
            key={index}
            style={{ height: `${slideHeight}rem` }}
            className={`flex items-center justify-center text-lg sm:text-xl ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {tagline}
          </p>
        ))}
      </div>
    </div>
  );
}