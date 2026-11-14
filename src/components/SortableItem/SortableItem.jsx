import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.65 : 1,
    background: 'transparent',
    borderRadius: '6px',
    overflow: 'hidden',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        className='sortable-handle'
      >
        ≡
      </div>

      <div style={{ touchAction: 'auto' }}>{children}</div>
    </div>
  );
}