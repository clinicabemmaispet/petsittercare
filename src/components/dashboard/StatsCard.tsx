import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'success';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatsCardProps) {
  const variants = {
    default: 'bg-card',
    primary: 'gradient-primary text-primary-foreground',
    accent: 'gradient-warm text-accent-foreground',
    success: 'bg-success text-success-foreground',
  };

  const iconVariants = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    accent: 'bg-accent-foreground/20 text-accent-foreground',
    success: 'bg-success-foreground/20 text-success-foreground',
  };

  return (
    <Card className={cn(
      "card-hover border-0 shadow-md overflow-hidden",
      variants[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              variant === 'default' ? 'text-muted-foreground' : 'opacity-80'
            )}>
              {title}
            </p>
            <p className="text-3xl font-bold font-display">{value}</p>
            {trend && (
              <p className={cn(
                "text-sm font-medium",
                trend.positive ? 'text-success' : 'text-destructive',
                variant !== 'default' && 'opacity-90'
              )}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% vs mês anterior
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            iconVariants[variant]
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
