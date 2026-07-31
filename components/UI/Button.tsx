import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
  icon?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, icon, className, ...props }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.1, y: y * 0.1 }); // Reduced movement for heavier, premium feel
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  // Base styles: Slow duration (700ms), smooth easing, uppercase tracking for editorial look
  const baseStyles = "relative inline-flex items-center justify-center px-8 py-4 text-sm font-medium tracking-widest uppercase transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] rounded-full font-display group overflow-hidden cursor-pointer active:scale-95";
  
  const variants = {
    // Primary: Deep cinematic red glow, luxury shine, gentle scale (reduced from 105 to 102)
    primary: "bg-accent text-white shadow-[0_0_20px_rgba(229,9,20,0.2)] hover:shadow-[0_0_40px_rgba(229,9,20,0.4)] hover:scale-[1.02] border border-transparent",
    
    // Secondary: Clean white, soft ambient glow on hover
    secondary: "bg-white text-zinc-950 hover:bg-zinc-100 hover:scale-[1.02] shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] border border-transparent",
    
    // Outline: Glassmorphism, subtle white glow, minimal scale
    outline: "bg-transparent text-white border border-white/20 hover:border-white/50 hover:bg-white/5 hover:scale-[1.02] backdrop-blur-sm shadow-none hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 20, mass: 1 }} // Heavier physics for luxury feel
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-3">
        {children}
        {icon && <ArrowRight className="w-4 h-4 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:translate-x-1" />}
      </span>
      
      {/* Cinematic Shine Effect - Primary Only */}
      {/* Skewed light sweep that moves slowly across the button */}
      {variant === 'primary' && (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-[150%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] skew-x-12 group-hover:translate-x-[150%] transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]" />
        </div>
      )}
    </motion.button>
  );
};