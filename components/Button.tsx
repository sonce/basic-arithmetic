import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '',
  ...props 
}) => {
  const baseStyles = "rounded-2xl font-bold transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-600 border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1",
    secondary: "bg-white text-indigo-600 hover:bg-indigo-50 border-b-4 border-gray-200 active:border-b-0 active:translate-y-1",
    success: "bg-green-400 text-white hover:bg-green-500 border-b-4 border-green-600 active:border-b-0 active:translate-y-1",
    danger: "bg-red-400 text-white hover:bg-red-500 border-b-4 border-red-600 active:border-b-0 active:translate-y-1",
    ghost: "bg-transparent text-indigo-600 hover:bg-indigo-100/50"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-xl",
    xl: "px-10 py-6 text-3xl"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;
