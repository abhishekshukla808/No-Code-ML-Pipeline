export type PipelineStage = 'upload' | 'preprocess' | 'split' | 'model' | 'results';

export type PreprocessingMethod = 'none' | 'standard' | 'minmax';

export type ModelType = 'logistic' | 'decision_tree';

export interface DatasetColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'unknown';
  sampleValues: (string | number)[];
}

export interface Dataset {
  rawData: Record<string, unknown>[];
  numericData: number[][];
  columns: DatasetColumn[];
  rows: number;
  fileName: string;
}

export interface PipelineConfig {
  preprocessing: PreprocessingMethod;
  splitRatio: number;
  targetColumn: string | null;
  featureColumns: string[];
  modelType: ModelType;
}

export interface TrainingResults {
  accuracy: number;
  trainAccuracy: number;
  predictions: number[];
  confusionMatrix: number[][];
  trainingTime: number;
  trainSize: number;
  testSize: number;
}

export interface PipelineState {
  currentStage: PipelineStage;
  dataset: Dataset | null;
  config: PipelineConfig;
  results: TrainingResults | null;
  isProcessing: boolean;
  error: string | null;
  completedStages: PipelineStage[];
}
