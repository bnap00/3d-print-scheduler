'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { QueueItem, GapItem, WaitUntilItem } from '@/types/scheduler';
import { formatDuration, formatDateTime, addMinutes } from '@/utils/time';
import { AddItemModal } from './AddItemModal';

interface PrintQueueProps {
  queue: QueueItem[];
  onReorder: (newQueue: QueueItem[]) => void;
  onRemove: (id: string) => void;
  onDuplicate: (item: QueueItem) => void;
  onMoveToCurrent: (item: QueueItem) => void;
  onInsertAfter: (afterId: string, newItem: QueueItem) => void;
  startTime: Date;
}

interface QueueItemCardProps {
  item: QueueItem;
  startTime: Date;
  endTime: Date;
  onRemove: (id: string) => void;
  onDuplicate: (item: QueueItem) => void;
  onMoveToCurrent: (item: QueueItem) => void;
  onAddGapBelow: () => void;
  onAddWaitBelow: () => void;
}

function QueueItemCard({ item, startTime, endTime, onRemove, onDuplicate, onMoveToCurrent, onAddGapBelow, onAddWaitBelow }: QueueItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isPrint = item.type === 'print';
  const isWait = item.type === 'wait';

  let borderColor = 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900';
  let badgeColor = 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
  let badgeText = 'Print';

  if (item.type === 'gap') {
    borderColor = 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/20';
    badgeColor = 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
    badgeText = 'Gap';
  } else if (item.type === 'wait') {
    borderColor = 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/20';
    badgeColor = 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
    badgeText = 'Wait';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border ${borderColor} p-4`}
    >
      <div className="flex items-stretch gap-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-3">
            <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 flex-1">
              {item.name}
            </h4>
            <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${badgeColor}`}>
              {badgeText}
            </span>
          </div>

          {isWait ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Wait until</p>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {formatDateTime(endTime)}
                </p>
              </div>
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Set time</p>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {item.waitUntilTime}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Duration</p>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {formatDuration(item.durationMinutes)}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Starts</p>
                <p className="text-base font-bold text-blue-900 dark:text-blue-50">
                  {formatDateTime(startTime)}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                <p className="text-xs text-green-700 dark:text-green-300 mb-1">Finishes</p>
                <p className="text-base font-bold text-green-900 dark:text-green-50">
                  {formatDateTime(endTime)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {isPrint && (
            <button
              type="button"
              onClick={() => onMoveToCurrent(item)}
              className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors whitespace-nowrap"
            >
              Move to Current
            </button>
          )}
          <button
            type="button"
            onClick={onAddGapBelow}
            className="px-3 py-2 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors whitespace-nowrap"
          >
            Add Gap Below
          </button>
          <button
            type="button"
            onClick={onAddWaitBelow}
            className="px-3 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors whitespace-nowrap"
          >
            Add Wait Below
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(item)}
            className="px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export function PrintQueue({ queue, onReorder, onRemove, onDuplicate, onMoveToCurrent, onInsertAfter, startTime }: PrintQueueProps) {
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'gap' | 'wait' | null; afterId: string | null }>({
    isOpen: false,
    type: null,
    afterId: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((item) => item.id === active.id);
      const newIndex = queue.findIndex((item) => item.id === over.id);
      const newQueue = arrayMove(queue, oldIndex, newIndex);
      onReorder(newQueue);
    }
  };

  const handleOpenGapModal = (afterId: string) => {
    setModalState({ isOpen: true, type: 'gap', afterId });
  };

  const handleOpenWaitModal = (afterId: string) => {
    setModalState({ isOpen: true, type: 'wait', afterId });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, type: null, afterId: null });
  };

  const handleAddItem = (newItem: QueueItem) => {
    if (modalState.afterId) {
      onInsertAfter(modalState.afterId, newItem);
    }
  };

  if (queue.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No items in queue. Add your first print below!</p>
      </div>
    );
  }

  let currentStartTime = startTime;
  const itemsWithTimes = queue.map((item) => {
    const itemStartTime = currentStartTime;
    let itemEndTime: Date;

    if (item.type === 'wait') {
      // Parse time string (HH:MM format)
      const [hours, minutes] = item.waitUntilTime.split(':').map(Number);

      // Create a date using the current start time's date
      const waitUntil = new Date(currentStartTime);
      waitUntil.setHours(hours, minutes, 0, 0);

      // If the wait time is before or equal to current start time, use next day
      if (waitUntil <= currentStartTime) {
        waitUntil.setDate(waitUntil.getDate() + 1);
      }

      itemEndTime = waitUntil;
    } else {
      itemEndTime = addMinutes(currentStartTime, item.durationMinutes);
    }

    currentStartTime = itemEndTime;
    return { item, startTime: itemStartTime, endTime: itemEndTime };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Print Queue ({queue.length})
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Drag to reorder
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={queue.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {itemsWithTimes.map(({ item, startTime: itemStart, endTime: itemEnd }) => (
              <QueueItemCard
                key={item.id}
                item={item}
                startTime={itemStart}
                endTime={itemEnd}
                onRemove={onRemove}
                onDuplicate={onDuplicate}
                onMoveToCurrent={onMoveToCurrent}
                onAddGapBelow={() => handleOpenGapModal(item.id)}
                onAddWaitBelow={() => handleOpenWaitModal(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <AddItemModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onAdd={handleAddItem}
        type={modalState.type || 'gap'}
      />
    </div>
  );
}
