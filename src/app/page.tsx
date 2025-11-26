'use client';

import { useState, useEffect } from 'react';
import type { QueueItem, PrintItem } from '@/types/scheduler';
import { CurrentPrint } from '@/components/CurrentPrint';
import { AddPrintForm } from '@/components/AddPrintForm';
import { PrintQueue } from '@/components/PrintQueue';
import { QuickAccess } from '@/components/QuickAccess';
import { addMinutes, formatDateTime } from '@/utils/time';

export default function Home() {
  const [currentPrint, setCurrentPrint] = useState<{ item: PrintItem; endTime: Date } | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [defaultGapMinutes, setDefaultGapMinutes] = useState(15);

  useEffect(() => {
    const saved = localStorage.getItem('scheduler-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setQueue(parsed.queue || []);
        setDefaultGapMinutes(parsed.defaultGapMinutes || 15);

        if (parsed.currentPrint) {
          setCurrentPrint({
            ...parsed.currentPrint,
            endTime: new Date(parsed.currentPrint.endTime),
          });
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    const state = {
      currentPrint,
      queue,
      defaultGapMinutes,
    };
    localStorage.setItem('scheduler-state', JSON.stringify(state));
  }, [currentPrint, queue, defaultGapMinutes]);

  const handleSetCurrent = (item: PrintItem, endTime: Date) => {
    setCurrentPrint({ item, endTime });
  };

  const handleClearCurrent = () => {
    setCurrentPrint(null);
  };

  const handleUpdateEndTime = (endTime: Date) => {
    if (currentPrint) {
      setCurrentPrint({ ...currentPrint, endTime });
    }
  };

  const handleAddPrint = (item: PrintItem) => {
    setQueue([...queue, item]);
  };

  const handleAddGap = (item: QueueItem) => {
    setQueue([...queue, item]);
  };

  const handleAddWaitUntil = (item: QueueItem) => {
    setQueue([...queue, item]);
  };

  const handleReorder = (newQueue: QueueItem[]) => {
    setQueue(newQueue);
  };

  const handleRemove = (id: string) => {
    setQueue(queue.filter((item) => item.id !== id));
  };

  const handleDuplicate = (item: QueueItem) => {
    const duplicatedItem: QueueItem = {
      ...item,
      id: `${item.type}-${Date.now()}-${Math.random()}`,
    };
    setQueue([...queue, duplicatedItem]);
  };

  const handleMoveToCurrent = (item: QueueItem) => {
    if (item.type !== 'print') {
      return;
    }

    const now = new Date();
    const endTime = addMinutes(now, item.durationMinutes);

    setCurrentPrint({
      item,
      endTime,
    });

    setQueue(queue.filter((q) => q.id !== item.id));
  };

  const handleInsertAfter = (afterId: string, newItem: QueueItem) => {
    const afterIndex = queue.findIndex((item) => item.id === afterId);
    if (afterIndex === -1) {
      setQueue([...queue, newItem]);
    } else {
      const newQueue = [
        ...queue.slice(0, afterIndex + 1),
        newItem,
        ...queue.slice(afterIndex + 1)
      ];
      setQueue(newQueue);
    }
  };

  const getQueueStartTime = (): Date => {
    if (currentPrint) {
      return currentPrint.endTime;
    }
    return new Date();
  };

  const getQueueCompletionTime = (): Date | null => {
    let currentTime = getQueueStartTime();

    for (const item of queue) {
      if (item.type === 'wait') {
        const [hours, minutes] = item.waitUntilTime.split(':').map(Number);
        const waitUntil = new Date(currentTime);
        waitUntil.setHours(hours, minutes, 0, 0);

        if (waitUntil <= currentTime) {
          waitUntil.setDate(waitUntil.getDate() + 1);
        }

        currentTime = waitUntil;
      } else {
        currentTime = addMinutes(currentTime, item.durationMinutes);
      }
    }

    return queue.length > 0 ? currentTime : null;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                3D Print Scheduler
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Manage your 3D printing queue and track progress
              </p>
            </div>
            {(currentPrint || queue.length > 0) && (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg px-6 py-4 shadow-lg">
                <p className="text-sm font-medium opacity-90 mb-1">Queue Completes</p>
                <p className="text-2xl font-bold">
                  {getQueueCompletionTime() ? formatDateTime(getQueueCompletionTime()!) : formatDateTime(currentPrint!.endTime)}
                </p>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
          <div className="lg:col-span-2 overflow-y-auto pr-2">
            <div className="space-y-8">
              <CurrentPrint
                currentPrint={currentPrint}
                onSetCurrent={handleSetCurrent}
                onUpdateEndTime={handleUpdateEndTime}
                onClear={handleClearCurrent}
              />

              <PrintQueue
                queue={queue}
                onReorder={handleReorder}
                onRemove={handleRemove}
                onDuplicate={handleDuplicate}
                onMoveToCurrent={handleMoveToCurrent}
                onInsertAfter={handleInsertAfter}
                startTime={getQueueStartTime()}
              />
            </div>
          </div>

          <div className="overflow-y-auto pr-2">
            <div className="space-y-6">
              <QuickAccess
                onAddGap={handleAddGap}
                onAddWaitUntil={handleAddWaitUntil}
              />

              <AddPrintForm
                onAddPrint={handleAddPrint}
                onAddGap={handleAddGap}
                onAddWaitUntil={handleAddWaitUntil}
                defaultGapMinutes={defaultGapMinutes}
                onUpdateDefaultGap={setDefaultGapMinutes}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
