import { GanTimerTime } from 'gan-web-bluetooth';

export interface Result {
  originalTime: GanTimerTime | undefined;
  scramble: string | undefined;
  time: string;
}
