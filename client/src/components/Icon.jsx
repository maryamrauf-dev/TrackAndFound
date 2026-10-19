export default function Icon({ name, size = 20, filled = false, className = '', style = {} }) {
  const customStyle = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    lineHeight: 1,
    userSelect: 'none',
    fontVariationSettings: filled ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 450",
    ...style,
  };

  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={customStyle}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
