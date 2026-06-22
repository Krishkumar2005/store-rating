const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}) => {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${loading ? "btn--loading" : ""} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="30" strokeDashoffset="10" />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
