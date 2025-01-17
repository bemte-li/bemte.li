interface HighlightProps {
  children: React.ReactNode;
  className?: string;
  color?: 'rosa' | 'citrino' | 'bordo';
}

const colorClasses = {
  rosa: 'bg-rosa/60',
  citrino: 'bg-citrino/60',
  bordo: 'bg-bordo/60'
} as const;

export function Highlight({ children, className = '', color = 'rosa' }: HighlightProps) {
  return (
    <span className={`inline-block relative ${className}`}>
      <span className={`absolute inset-x-0 bottom-1 h-1 ${colorClasses[color]}`}></span>
      <span className="relative z-10">{children}</span>
    </span>
  );
} 