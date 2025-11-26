'use client';

import { useState, useEffect } from 'react';
import type { PrintItem } from '@/types/scheduler';
import { formatDateTime, getRemainingTime, addMinutes } from '@/utils/time';

interface CurrentPrintProps {
  currentPrint: { item: PrintItem; endTime: Date } | null;
  onSetCurrent: (item: PrintItem, endTime: Date) => void;
  onUpdateEndTime: (endTime: Date) => void;
  onClear: () => void;
}

export function CurrentPrint({ currentPrint, onSetCurrent, onUpdateEndTime, onClear }: CurrentPrintProps) {
  const [name, setName] = useState('');
  const [inputMode, setInputMode] = useState<'remaining' | 'completionTime'>('remaining');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [completionDate, setCompletionDate] = useState('');
  const [completionTime, setCompletionTime] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isEditingTime, setIsEditingTime] = useState(false);

  useEffect(() => {
    if (!currentPrint) {
      return;
    }

    const updateTime = () => {
      const remaining = getRemainingTime(currentPrint.endTime);
      setTimeRemaining(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [currentPrint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    let endTime: Date;

    if (inputMode === 'remaining') {
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes <= 0) {
        return;
      }
      endTime = addMinutes(new Date(), totalMinutes);
    } else {
      const now = new Date();
      const dateToUse = completionDate || now.toISOString().split('T')[0];
      const timeToUse = completionTime || now.toTimeString().slice(0, 5);

      if (!timeToUse) {
        return;
      }

      endTime = new Date(`${dateToUse}T${timeToUse}`);
      if (isNaN(endTime.getTime())) {
        return;
      }
    }

    const item: PrintItem = {
      id: `print-${Date.now()}`,
      name: name.trim(),
      durationMinutes: Math.ceil((endTime.getTime() - new Date().getTime()) / 1000 / 60),
      type: 'print'
    };

    onSetCurrent(item, endTime);

    setName('');
    setHours(0);
    setMinutes(0);
    setCompletionDate('');
    setCompletionTime('');
  };

  const handleEditTime = () => {
    if (currentPrint) {
      const endTime = currentPrint.endTime;
      const dateStr = endTime.toISOString().split('T')[0];
      const timeStr = endTime.toTimeString().slice(0, 5);
      setCompletionDate(dateStr);
      setCompletionTime(timeStr);

      const now = new Date();
      const diffMinutes = Math.ceil((endTime.getTime() - now.getTime()) / 1000 / 60);
      setHours(Math.floor(diffMinutes / 60));
      setMinutes(diffMinutes % 60);
    }
    setIsEditingTime(true);
  };

  const handleUpdateTime = () => {
    let endTime: Date;

    if (inputMode === 'remaining') {
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes <= 0) {
        return;
      }
      endTime = addMinutes(new Date(), totalMinutes);
    } else {
      if (!completionDate || !completionTime) {
        return;
      }
      endTime = new Date(`${completionDate}T${completionTime}`);
      if (isNaN(endTime.getTime())) {
        return;
      }
    }

    onUpdateEndTime(endTime);
    setIsEditingTime(false);
  };

  const handleCancelEdit = () => {
    setIsEditingTime(false);
    setHours(0);
    setMinutes(0);
    setCompletionDate('');
    setCompletionTime('');
  };

  if (currentPrint) {
    return (
      <div className="rounded-lg border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/20 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                PRINTING NOW
              </span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {currentPrint.item.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
          >
            Clear
          </button>
        </div>

        {!isEditingTime ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Finishes at</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {formatDateTime(currentPrint.endTime)}
                </p>
                <button
                  type="button"
                  onClick={handleEditTime}
                  className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Time remaining</p>
              <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {timeRemaining}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 border-t border-blue-200 dark:border-blue-800 pt-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Update Finish Time
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode('remaining')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'remaining'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Remaining Time
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('completionTime')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === 'completionTime'
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  Completion Time
                </button>
              </div>
            </div>

            {inputMode === 'remaining' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editHours" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Hours
                  </label>
                  <input
                    type="number"
                    id="editHours"
                    min="0"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="editMinutes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    id="editMinutes"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editCompletionDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="editCompletionDate"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="editCompletionTime" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="editCompletionTime"
                    value={completionTime}
                    onChange={(e) => setCompletionTime(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleUpdateTime}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().slice(0, 5);

  return (
    <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
        Set Current Print
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPrintName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Print Name
          </label>
          <input
            type="text"
            id="currentPrintName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Phone Stand"
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Input Mode
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInputMode('remaining')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                inputMode === 'remaining'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Remaining Time
            </button>
            <button
              type="button"
              onClick={() => setInputMode('completionTime')}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                inputMode === 'completionTime'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Completion Time
            </button>
          </div>
        </div>

        {inputMode === 'remaining' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="currentHours" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Hours
              </label>
              <input
                type="number"
                id="currentHours"
                min="0"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="currentMinutes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Minutes
              </label>
              <input
                type="number"
                id="currentMinutes"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="completionDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Date
              </label>
              <input
                type="date"
                id="completionDate"
                value={completionDate || defaultDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="completionTime" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Time
              </label>
              <input
                type="time"
                id="completionTime"
                value={completionTime || defaultTime}
                onChange={(e) => setCompletionTime(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Set as Current Print
        </button>
      </form>
    </div>
  );
}
