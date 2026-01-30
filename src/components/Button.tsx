import clsx from 'clsx';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  loading?: boolean;
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
  loading = false,
}: ButtonProps) {
  const baseClasses = 'px-6 py-3 rounded-button font-semibold transition-fast';
  
  const variantClasses = {
    primary: 'bg-primary-800 text-white hover:bg-primary-700',
    secondary: 'bg-white text-primary-800 border-2 border-primary-800 hover:bg-primary-100',
    danger: 'bg-danger-600 text-white hover:bg-danger-700',
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
    >
      {loading ? <span>Chargement...</span> : children}
    </button>
  );
}