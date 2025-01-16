interface HighlightProps {
  children: React.ReactNode;
  className?: string;
  color?: 'rosa' | 'citrino' | 'bordo';
}

export function Highlight({ children, className = '', color = 'rosa' }: HighlightProps) {
  return (
    <span className={`inline-block relative ${className}`}>
      <span className={`absolute inset-x-0 bottom-1 h-1 bg-${color}/60`}></span>
      <span className="relative z-10">{children}</span>
    </span>
  );
} 