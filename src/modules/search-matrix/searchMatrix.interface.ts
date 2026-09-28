export interface ISearchMatrix {
  id: string;

  name: string;

  businessCategory: string;
  location: string;
  query: string;

  priority: number;
  enabled: boolean;

  lastExecutedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
