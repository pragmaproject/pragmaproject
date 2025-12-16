import React from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface FadeInProps {
  children: React.ReactNode;
  delay?: string; // Tailwind delay class e.g. 'delay-100'
  className?: string;
}

const FadeIn: React.FC<FadeInProps> = ({ children, delay = '', className = '' }) => {
  const { isVisible, domRef } = useIntersectionObserver();

  return (
    <div
      ref={domRef}
      className={`fade-in-section ${isVisible ? 'is-visible' : ''} ${delay} ${className}`}
    >
      {children}
    </div>
  );
};

export default FadeIn;