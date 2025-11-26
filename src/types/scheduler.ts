export interface PrintItem {
  id: string;
  name: string;
  durationMinutes: number;
  type: 'print';
}

export interface GapItem {
  id: string;
  name: string;
  durationMinutes: number;
  type: 'gap';
}

export interface WaitUntilItem {
  id: string;
  name: string;
  waitUntilTime: string; // HH:MM format (24-hour)
  type: 'wait';
}

export type QueueItem = PrintItem | GapItem | WaitUntilItem;

export interface CurrentPrint {
  item: PrintItem;
  startTime: Date;
  endTime: Date;
}

export interface SchedulerState {
  currentPrint: CurrentPrint | null;
  queue: QueueItem[];
  defaultGapMinutes: number;
}
