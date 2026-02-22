import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  // Stock statuses
  normal: 'bg-green-100 text-green-800 border-green-200',
  low_stock: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  out_of_stock: 'bg-red-100 text-red-800 border-red-200',
  overstock: 'bg-blue-100 text-blue-800 border-blue-200',

  // Quality statuses
  available: 'bg-green-100 text-green-800 border-green-200',
  quarantine: 'bg-orange-100 text-orange-800 border-orange-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pending_inspection: 'bg-blue-100 text-blue-800 border-blue-200',

  // PO statuses
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  submitted: 'bg-blue-100 text-blue-800 border-blue-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  partially_received: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  received: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',

  // SO statuses
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  picking: 'bg-purple-100 text-purple-800 border-purple-200',
  picked: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  packing: 'bg-purple-100 text-purple-800 border-purple-200',
  packed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped: 'bg-green-100 text-green-800 border-green-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  returned: 'bg-orange-100 text-orange-800 border-orange-200',

  // Count statuses
  planned: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-green-100 text-green-800 border-green-200',

  // Alert severities
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  critical: 'bg-red-100 text-red-800 border-red-200',

  // Priority
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  priority_normal: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',

  // Inspection results
  passed: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  conditional: 'bg-yellow-100 text-yellow-800 border-yellow-200',

  // Boolean active
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
};

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES['draft'];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', style, className)}
    >
      {label ?? status.replace(/_/g, ' ')}
    </Badge>
  );
}
