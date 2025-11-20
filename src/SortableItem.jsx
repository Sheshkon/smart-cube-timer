import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // marginBottom: '1rem',
    opacity: isDragging ? 0.65 : 1,
    background: 'transparent',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          touchAction: 'none', // critical: only on the handle
          userSelect: 'none',
          padding: '1px',
          // marginBottom: '8px',
          borderRadius: '6px',
          // background: 'var(--handle-bg, #f3f4f6)',
        }}
      >
        ≡
      </div>

      <div style={{ touchAction: 'auto' }}>{children}</div>
    </div>
  );
}
