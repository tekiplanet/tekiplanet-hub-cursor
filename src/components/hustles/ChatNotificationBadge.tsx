import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatNotificationBadgeProps {
  count: number;
  className?: string;
}

export const ChatNotificationBadge = ({ count, className }: ChatNotificationBadgeProps) => {
  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        "absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full",
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
}; 