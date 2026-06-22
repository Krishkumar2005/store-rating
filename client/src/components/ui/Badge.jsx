const Badge = ({ children, variant = "default" }) => {
  return <span className={`badge badge--${variant.toLowerCase()}`}>{children}</span>;
};

export default Badge;
