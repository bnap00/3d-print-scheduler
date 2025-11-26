'use client';

import { useState } from 'react';
import type { GapItem, WaitUntilItem } from '@/types/scheduler';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: GapItem | WaitUntilItem) => void;
  type: 'gap' | 'wait';
}

const PRESET_GAPS = [
  { label: '15min', minutes: 15 },
  { label: '30min', minutes: 30 },
  { label: '1hr', minutes: 60 },
  { label: '2hr', minutes: 120 },
];

const PRESET_WAITS = [
  { label: '8 AM', time: '08:00' },
  { label: '9 AM', time: '09:00' },
  { label: '12 PM', time: '12:00' },
  { label: '6 PM', time: '18:00' },
];

export function AddItemModal({ isOpen, onClose, onAdd, type }: AddItemModalProps) {
  const [customHours, setCustomHours] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [customTime, setCustomTime] = useState('');

  if (!isOpen) return null;

  const handlePresetGap = (minutes: number) => {
    const gapItem: GapItem = {
      id: `gap-${Date.now()}-${Math.random()}`,
      name: 'Prep Time',
      durationMinutes: minutes,
      type: 'gap'
    };
    onAdd(gapItem);
    onClose();
  };

  const handleCustomGap = () => {
    const totalMinutes = customHours * 60 + customMinutes;
    if (totalMinutes <= 0) return;

    const gapItem: GapItem = {
      id: `gap-${Date.now()}-${Math.random()}`,
      name: 'Prep Time',
      durationMinutes: totalMinutes,
      type: 'gap'
    };
    onAdd(gapItem);
    setCustomHours(0);
    setCustomMinutes(0);
    onClose();
  };

  const handlePresetWait = (time: string) => {
    const waitItem: WaitUntilItem = {
      id: `wait-${Date.now()}-${Math.random()}`,
      name: 'Wait Until',
      waitUntilTime: time,
      type: 'wait'
    };
    onAdd(waitItem);
    onClose();
  };

  const handleCustomWait = () => {
    if (!customTime) return;

    const waitItem: WaitUntilItem = {
      id: `wait-${Date.now()}-${Math.random()}`,
      name: 'Wait Until',
      waitUntilTime: customTime,
      type: 'wait'
    };
    onAdd(waitItem);
    setCustomTime('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {type === 'gap' ? 'Add Gap Below' : 'Add Wait Below'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {type === 'gap' ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Quick Add
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_GAPS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetGap(preset.minutes)}
                    className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg font-medium transition-colors border border-orange-300 dark:border-orange-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Custom Duration
              </p>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label htmlFor="gapHours" className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    Hours
                  </label>
                  <input
                    type="number"
                    id="gapHours"
                    min="0"
                    value={customHours}
                    onChange={(e) => setCustomHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="gapMinutes" className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    id="gapMinutes"
                    min="0"
                    max="59"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleCustomGap}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Custom Gap
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Quick Add
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_WAITS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetWait(preset.time)}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg font-medium transition-colors border border-purple-300 dark:border-purple-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Custom Time
              </p>
              <div className="mb-3">
                <label htmlFor="waitTime" className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  id="waitTime"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleCustomWait}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Custom Wait
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
