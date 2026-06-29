import { cn } from '../../utils/cn';

type Variant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success';

const variants: Record<Variant, string> = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'text-foreground border-border',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  success: 'border-transparent bg-green-600 text-white',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}