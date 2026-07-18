import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', type = 'text', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`px-3 py-2 bg-bg-surface border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-border-main focus:ring-brand-primary'
          } rounded-lg text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg-surface transition-all w-full ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
