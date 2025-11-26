'use client';

import type { GapItem, WaitUntilItem } from '@/types/scheduler';
import { formatDuration } from '@/utils/time';

interface PresetGap {
  label: string;
  minutes: number;
}

interface PresetWait {
  label: string;
  time: string;
}

interface QuickAccessProps {
  onAddGap: (item: GapItem) => void;
  onAddWaitUntil: (item: WaitUntilItem) => void;
}

const PRESET_GAPS: PresetGap[] = [
  { label: '15min Gap', minutes: 15 },
  { label: '30min Gap', minutes: 30 },
  { label: '1hr Gap', minutes: 60 },
  { label: '2hr Gap', minutes: 120 },
];

const PRESET_WAITS: PresetWait[] = [
  { label: 'Wait 8 AM', time: '08:00' },
  { label: 'Wait 9 AM', time: '09:00' },
  { label: 'Wait 12 PM', time: '12:00' },
  { label: 'Wait 6 PM', time: '18:00' },
];

export function QuickAccess({ onAddGap, onAddWaitUntil }: QuickAccessProps) {
  const handleAddGap = (preset: PresetGap) => {
    const gapItem: GapItem = {
      id: `gap-${Date.now()}-${Math.random()}`,
      name: 'Prep Time',
      durationMinutes: preset.minutes,
      type: 'gap'
    };
    onAddGap(gapItem);
  };

  const handleAddWait = (preset: PresetWait) => {
    const waitItem: WaitUntilItem = {
      id: `wait-${Date.now()}-${Math.random()}`,
      name: 'Wait Until',
      waitUntilTime: preset.time,
      type: 'wait'
    };
    onAddWaitUntil(waitItem);
  };

  return (
    <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Quick Add
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Click to quickly add preset items to queue
      </p>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Gap Times
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_GAPS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleAddGap(preset)}
                className="px-3 py-2 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg font-medium transition-colors border border-orange-300 dark:border-orange-700"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Wait Until
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_WAITS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleAddWait(preset)}
                className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg font-medium transition-colors border border-purple-300 dark:border-purple-700"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
