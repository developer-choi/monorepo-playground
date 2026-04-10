import type {ButtonHTMLAttributes, ReactNode} from 'react';
import styles from './index.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
}

export const Button = ({children, variant = 'primary', size = 'medium', className = '', ...props}: ButtonProps) => {
  const classNames = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

  return (
    // eslint-disable-next-line no-restricted-syntax -- TODO: Button 컴포넌트 자체가 <button>을 추상화하는 공통 컴포넌트이므로 예외
    <button className={classNames} {...props}>
      {children}
    </button>
  );
};
