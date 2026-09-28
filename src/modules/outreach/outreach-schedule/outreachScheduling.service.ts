import { addMinutes } from 'date-fns';
import {
  IApplicationSettings,
  OutreachSpreadStrategy,
} from '../../application-settings/applicationSettings.interface';
import { OutreachSchedule } from './outreachSchedule.interface';

export class OutreachSchedulingService {
  static generate(
    settings: IApplicationSettings,
    total: number,
  ): OutreachSchedule[] {
    switch (settings.outreach.spreadStrategy) {
      case OutreachSpreadStrategy.EVEN:
        return this.generateEven(settings, total);

      case OutreachSpreadStrategy.BURST:
        return this.generateBurst(settings, total);

      case OutreachSpreadStrategy.RANDOM:
      default:
        return this.generateRandom(settings, total);
    }
  }

  private static generateRandom(
    settings: IApplicationSettings,
    total: number,
  ): OutreachSchedule[] {
    const window = this.getAvailableWindow(settings);
    if (!window) {
      return [];
    }

    const { start, end } = window;

    const schedules: OutreachSchedule[] = [];

    const windowMs = end.getTime() - start.getTime();

    for (let i = 0; i < total; i++) {
      schedules.push({
        scheduledFor: new Date(start.getTime() + Math.random() * windowMs),
      });
    }

    return schedules.sort(
      (a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime(),
    );
  }

  private static generateEven(
    settings: IApplicationSettings,
    total: number,
  ): OutreachSchedule[] {
    const window = this.getAvailableWindow(settings);
    if (!window) {
      return [];
    }

    const { start, end } = window;

    const schedules: OutreachSchedule[] = [];

    const spacing = (end.getTime() - start.getTime()) / total;

    for (let i = 0; i < total; i++) {
      schedules.push({
        scheduledFor: new Date(start.getTime() + spacing * i),
      });
    }

    return schedules;
  }

  private static generateBurst(
    settings: IApplicationSettings,
    total: number,
  ): OutreachSchedule[] {
    const window = this.getAvailableWindow(settings);
    if (!window) {
      return [];
    }

    const { start } = window;

    return Array.from({ length: total }, (_, index) => ({
      scheduledFor: addMinutes(start, index * 2),
    }));
  }

  private static getAvailableWindow(
    settings: IApplicationSettings,
  ): { start: Date; end: Date } | null {
    const now = new Date();

    const end = new Date(now);

    const [endHour, endMinute] = settings.outreach.sendWindowEnd
      .split(':')
      .map(Number);

    end.setHours(endHour, endMinute, 0, 0);

    // Already outside sending window
    if (now >= end) {
      return null;
    }

    return {
      start: now,
      end,
    };
  }
}
