import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  href?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  href,
}: ButtonProps) {
  const baseStyles = 'rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-soft hover:shadow-medium';

  const variants = {
    primary: 'bg-primary text-light hover:bg-primary-light focus:ring-primary',
    accent: 'bg-accent text-light hover:bg-accent-light focus:ring-accent',
    outline: 'border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
