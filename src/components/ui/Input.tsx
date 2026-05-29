import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <input
        className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
        {...props}
      />

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
