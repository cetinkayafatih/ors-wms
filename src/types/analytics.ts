/**
 * Analytics Module Types
 * Forecasting, Lean, Comparison
 */

// ─── Forecasting Types ───────────────────────────────────────

export interface DemandHistoryItem {
  month: string;
  actual: number;
  forecast?: number;
}

export interface ABCItemData {
  id: string;
  name: string;
  sku: string;
  annualUsageValue: number;
  quantity: number;
  unitCost: number;
}

export interface EOQDefaults {
  annualDemand: number;
  orderingCost: number;
  holdingCost: number;
  productName: string;
}

export interface MonteCarloResult {
  iterations: number;
  histogram: { bin: number; count: number }[];
  mean: number;
  stdDev: number;
  percentile95: number;
  percentile99: number;
  safetyStock95: number;
  safetyStock99: number;
}

export interface HoltSmoothingResult {
  forecast: number[];
  nextPeriods: number[];
  mae: number;
  mape: number;
}

// ─── Lean Types ──────────────────────────────────────────────

export interface VSMStep {
  id: string;
  stepNumber: number;
  processName: string;
  cycleTimeMinutes: number;
  waitTimeMinutes: number;
  valueAddedPercentage: number;
  operators: number;
  wip: number;
  notes?: string;
}

export interface FiveSAudit {
  id: string;
  auditDate: string;
  area: string;
  sort: number;       // Seiri
  setInOrder: number;  // Seiton
  shine: number;       // Seiso
  standardize: number; // Seiketsu
  sustain: number;     // Shitsuke
  total: number;
  auditor: string;
  notes?: string;
}

export type KanbanColumnStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'testing'
  | 'done'
  | 'archived';

export interface KanbanItem {
  id: string;
  title: string;
  description: string;
  columnStatus: KanbanColumnStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  referenceType?: string;
  referenceId?: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MudaCategory {
  id: string;
  wasteType: string;
  wasteTypeTr: string;
  currentScore: number;  // 1-10
  targetScore: number;
  description: string;
  improvementSuggestion: string;
}

// ─── Comparison Types ────────────────────────────────────────

export type PeriodType = 'before' | 'after';

export interface ComparisonMetric {
  id: string;
  metricName: string;
  metricNameTr: string;
  unit: string;
  category: 'accuracy' | 'speed' | 'efficiency' | 'quality';
  beforeValues: number[];
  afterValues: number[];
  beforeMean: number;
  afterMean: number;
  improvementPercent: number;
  isHigherBetter: boolean;
}

export interface TTestResult {
  tValue: number;
  pValue: number;
  degreesOfFreedom: number;
  isSignificant: boolean;
  confidenceLevel: number;
  meanDifference: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  equation: string;
  points: { x: number; y: number }[];
  regressionLine: { x: number; y: number }[];
}

export interface DescriptiveStatsResult {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  count: number;
}

