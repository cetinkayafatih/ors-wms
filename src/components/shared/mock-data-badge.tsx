import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface MockDataBadgeProps {
  show: boolean;
}

export function MockDataBadge({ show }: MockDataBadgeProps) {
  if (!show) return null;

  return (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
      <Info className="size-3" />
      Ornek Veri
    </Badge>
  );
}
