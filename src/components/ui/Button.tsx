interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const Button = ({ loading, children, ...props }: ButtonProps) => {
  return (
    <button className="btn-primary w-full" disabled={loading} {...props}>
      {loading ? 'Loading...' : children}
    </button>
  );
};
