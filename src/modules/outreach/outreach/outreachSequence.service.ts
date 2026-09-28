export class OutreachSequenceService {
  static getNextStep(currentStep: number) {
    const sequence: Record<number, number | null> = {
      1: 3,
      2: 7,
      3: 14,
      4: null,
    };

    return sequence[currentStep];
  }
}
