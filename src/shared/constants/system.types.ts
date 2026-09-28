import { PROVIDERS, SERVICES, CATEGORIES } from '../constants';

export type Provider = (typeof PROVIDERS)[number];
export type Service = (typeof SERVICES)[number];
export type Category = (typeof CATEGORIES)[number];

export type CostStatus = 'success' | 'retry' | 'failed';
export type Currency = 'USD' | 'AED';
