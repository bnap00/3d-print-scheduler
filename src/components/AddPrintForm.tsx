'use client';

import { useState } from 'react';
import type { PrintItem, GapItem, WaitUntilItem } from '@/types/scheduler';

interface AddPrintFormProps {
  onAddPrint: (item: PrintItem) => void;
  onAddGap: (item: GapItem) => void;
  onAddWaitUntil: (item: WaitUntilItem) => void;
  defaultGapMinutes: number;
  onUpdateDefaultGap: (minutes: number) => void;
}

export function AddPrintForm({ onAddPrint, onAddGap, onAddWaitUntil, defaultGapMinutes, onUpdateDefaultGap }: AddPrintFormProps) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const [gapHours, setGapHours] = useState(Math.floor(defaultGapMinutes / 60));
  const [gapMinutes, setGapMinutes] = useState(defaultGapMinutes % 60);

  const [waitTime, setWaitTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    const totalMinutes = hours * 60 + minutes;

    if (totalMinutes <= 0) {
      return;
    }

    const printItem: PrintItem = {
      id: `print-${Date.now()}-${Math.random()}`,
      name: name.trim(),
      durationMinutes: totalMinutes,
      type: 'print'
    };

    onAddPrint(printItem);

    setName('');
    setHours(0);
    setMinutes(0);
  };

  const handleAddGap = () => {
    const totalMinutes = gapHours * 60 + gapMinutes;

    if (totalMinutes <= 0) {
      return;
    }

    const gapItem: GapItem = {
      id: `gap-${Date.now()}-${Math.random()}`,
      name: 'Prep Time',
      durationMinutes: totalMinutes,
      type: 'gap'
    };

    onAddGap(gapItem);
  };

  const handleUpdateDefaultGap = () => {
    const totalMinutes = gapHours * 60 + gapMinutes;
    onUpdateDefaultGap(totalMinutes);
  };

  const handleAddWaitUntil = () => {
    if (!waitTime) {
      return;
    }

    const waitItem: WaitUntilItem = {
      id: `wait-${Date.now()}-${Math.random()}`,
      name: 'Wait Until',
      waitUntilTime: waitTime,
      type: 'wait'
    };

    onAddWaitUntil(waitItem);
    setWaitTime('');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Add Print to Queue
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="printName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Print Name
            </label>
            <input
              type="text"
              id="printName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Phone Stand"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Hours
              </label>
              <input
                type="number"
                id="hours"
                min="0"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="minutes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Minutes
              </label>
              <input
                type="number"
                id="minutes"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Add to Queue
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Prep/Gap Time
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="gapHours" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Hours
              </label>
              <input
                type="number"
                id="gapHours"
                min="0"
                value={gapHours}
                onChange={(e) => setGapHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="gapMinutes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Minutes
              </label>
              <input
                type="number"
                id="gapMinutes"
                min="0"
                max="59"
                value={gapMinutes}
                onChange={(e) => setGapMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddGap}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Gap to Queue
            </button>
            <button
              type="button"
              onClick={handleUpdateDefaultGap}
              className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
            >
              Set Default
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Wait Until Time
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Pause the queue until a specific time (useful for overnight prints)
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="waitTime" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Time (e.g., 08:00 AM)
            </label>
            <input
              type="time"
              id="waitTime"
              value={waitTime}
              onChange={(e) => setWaitTime(e.target.value)}
              placeholder="08:00"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="button"
            onClick={handleAddWaitUntil}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Add Wait Block to Queue
          </button>
        </div>
      </div>
    </div>
  );
}
