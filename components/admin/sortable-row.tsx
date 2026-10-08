"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, ChevronRight } from "lucide-react";
import type { Entry } from "@/types/content";
export default function SortableRow({
  item,
  title,
  subtitle,
  selected,
  onSelect,
}: {
  item: Entry;
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={"admin-row " + (selected ? "selected" : "")}
    >
      <button
        className="icon-button drag-handle"
        aria-label={"Reordenar " + title}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <button className="admin-row-select" onClick={onSelect}>
        <strong>{title}</strong>
        <span>{subtitle}</span>
        <span>
          {item.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </span>
        <ChevronRight size={17} />
      </button>
    </div>
  );
}
