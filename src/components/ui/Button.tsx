import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = ({ loading, children, ...props }: ButtonProps) => {
  return (
    <button className="btn-primary w-full disabled:opacity-50" disabled={loading} {...props}>
      {loading ? 'Loading...' : children}
    </button>
  );
};
