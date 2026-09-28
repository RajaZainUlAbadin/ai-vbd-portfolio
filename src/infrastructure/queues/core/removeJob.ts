import { Queue } from 'bullmq';

export async function removeJob(queue: Queue, jobId: string): Promise<boolean> {
  const job = await queue.getJob(jobId);

  if (!job) {
    return false;
  }

  await job.remove();

  return true;
}
