import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EntityCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export const EntityCardActions = ({
  onEdit,
  onDelete,
  editLabel = 'Edit',
  deleteLabel = 'Delete',
}: EntityCardActionsProps) => (
  <div className="mt-4 flex gap-2 border-t border-border pt-3">
    <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
      <Pencil size={14} /> {editLabel}
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:bg-destructive/10"
      onClick={onDelete}
    >
      <Trash2 size={14} /> {deleteLabel}
    </Button>
  </div>
);
