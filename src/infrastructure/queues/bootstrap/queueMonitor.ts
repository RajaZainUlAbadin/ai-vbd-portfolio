import { QUEUE_NAMES } from '../constants/queueNames';
import { QueueMonitorService } from '../queue-monitor.service';

export const queueMonitor = new QueueMonitorService();

export function initializeQueueMonitoring(): void {
  Object.values(QUEUE_NAMES).forEach((queueName) => {
    queueMonitor.registerQueue(queueName);
  });
}

export { QueueMonitorService };
