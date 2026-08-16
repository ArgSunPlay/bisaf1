import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showLockIcon?: boolean;
  wrapperClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showLockIcon = false,
  wrapperClassName = '',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`relative flex items-center ${wrapperClassName}`}>
      {showLockIcon && (
        <Lock className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
      )}
      <input
        type={showPassword ? 'text' : 'password'}
        className={`w-full ${showLockIcon ? 'pr-9.5 pr-10' : 'pr-3.5'} pl-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left transition-colors ${className}`}
        dir="ltr"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/60 transition-colors focus:outline-none"
        title={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
        aria-label={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
      >
        {showPassword ? <EyeOff className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};
