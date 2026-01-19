import type {ButtonHTMLAttributes, CSSProperties, ReactNode} from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  style,
  ...props
}: ButtonProps) => {
  const baseStyle: CSSProperties = {
    fontWeight: 600,
    borderRadius: '0.375rem',
    transition: 'all 0.2s',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
  };

  const variantStyles: Record<string, CSSProperties> = {
    primary: {
      backgroundColor: '#2563eb',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#4b5563',
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#2563eb',
      border: '2px solid #2563eb',
    },
  };

  const sizeStyles: Record<string, CSSProperties> = {
    small: {
      padding: '0.25rem 0.75rem',
      fontSize: '0.875rem',
    },
    medium: {
      padding: '0.5rem 1rem',
      fontSize: '1rem',
    },
    large: {
      padding: '0.75rem 1.5rem',
      fontSize: '1.125rem',
    },
  };

  const combinedStyle = {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  return (
    <button style={combinedStyle} {...props}>
      {children}
    </button>
  );
};
