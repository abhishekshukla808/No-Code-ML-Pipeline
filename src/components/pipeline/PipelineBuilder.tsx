import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineFlow } from './PipelineFlow';
import { DatasetUpload } from './DatasetUpload';
import { PreprocessingConfig } from './PreprocessingConfig';
import { TrainTestSplit } from './TrainTestSplit';
import { ModelSelection } from './ModelSelection';
import { ResultsView } from './ResultsView';
import { PipelineState, PipelineStage, Dataset } from '@/types/pipeline';
import {
  standardScaler,
  minMaxScaler,
  trainTestSplit,
  logisticRegression,
  predictLogistic,
  decisionTreeClassifier,
  predictDecisionTree,
  calculateAccuracy,
  confusionMatrix,
} from '@/lib/ml-utils';
import { useToast } from '@/hooks/use-toast';

const initialState: PipelineState = {
  currentStage: 'upload',
  dataset: null,
  config: {
    preprocessing: 'standard',
    splitRatio: 0.2,
    targetColumn: null,
    featureColumns: [],
    modelType: 'logistic',
  },
  results: null,
  isProcessing: false,
  error: null,
  completedStages: [],
};

export function PipelineBuilder() {
  const [state, setState] = useState<PipelineState>(initialState);
  const { toast } = useToast();

  const setStage = useCallback((stage: PipelineStage) => {
    setState(prev => ({ ...prev, currentStage: stage }));
  }, []);

  const markStageComplete = useCallback((stage: PipelineStage) => {
    setState(prev => ({
      ...prev,
      completedStages: prev.completedStages.includes(stage)
        ? prev.completedStages
        : [...prev.completedStages, stage],
    }));
  }, []);

  const handleDatasetLoaded = useCallback((dataset: Dataset | null) => {
    if (dataset) {
      const numericCols = dataset.columns.filter(c => c.type === 'numeric');
      setState(prev => ({
        ...prev,
        dataset,
        config: {
          ...prev.config,
          targetColumn: numericCols[numericCols.length - 1]?.name || null,
          featureColumns: numericCols.slice(0, -1).map(c => c.name),
        },
      }));
    } else {
      setState(prev => ({ ...prev, dataset: null }));
    }
  }, []);

  const handleTrain = useCallback(async () => {
    const { dataset, config } = state;
    if (!dataset || !config.targetColumn || config.featureColumns.length === 0) {
      toast({
        title: 'Configuration Error',
        description: 'Please ensure all configuration options are set correctly.',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const startTime = performance.now();

      // Extract features and target
      const featureIndices = config.featureColumns.map(name => 
        dataset.columns.findIndex(c => c.name === name)
      );
      const targetIndex = dataset.columns.findIndex(c => c.name === config.targetColumn);

      let X = dataset.rawData.map(row =>
        featureIndices.map(i => {
          const val = Number(row[dataset.columns[i].name]);
          return isNaN(val) ? 0 : val;
        })
      );

      const y = dataset.rawData.map(row => {
        const val = Number(row[config.targetColumn!]);
        return isNaN(val) ? 0 : (val > 0.5 ? 1 : 0); // Binary classification
      });

      // Apply preprocessing
      if (config.preprocessing === 'standard') {
        X = standardScaler(X);
      } else if (config.preprocessing === 'minmax') {
        X = minMaxScaler(X);
      }

      // Train-test split
      const { X_train, X_test, y_train, y_test } = trainTestSplit(X, y, config.splitRatio);

      let predictions: number[];
      let trainPredictions: number[];

      if (config.modelType === 'logistic') {
        const { weights, bias } = logisticRegression(X_train, y_train);
        predictions = predictLogistic(X_test, weights, bias);
        trainPredictions = predictLogistic(X_train, weights, bias);
      } else {
        const tree = decisionTreeClassifier(X_train, y_train);
        predictions = predictDecisionTree(X_test, tree);
        trainPredictions = predictDecisionTree(X_train, tree);
      }

      const accuracy = calculateAccuracy(y_test, predictions);
      const trainAccuracy = calculateAccuracy(y_train, trainPredictions);
      const cm = confusionMatrix(y_test, predictions);
      const trainingTime = Math.round(performance.now() - startTime);

      setState(prev => ({
        ...prev,
        isProcessing: false,
        results: {
          accuracy,
          trainAccuracy,
          predictions,
          confusionMatrix: cm,
          trainingTime,
          trainSize: X_train.length,
          testSize: X_test.length,
        },
        currentStage: 'results',
        completedStages: [...prev.completedStages, 'model', 'results'],
      }));

      toast({
        title: 'Training Complete',
        description: `Model achieved ${(accuracy * 100).toFixed(2)}% accuracy on test data.`,
      });
    } catch (error) {
      console.error('Training error:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Training failed',
      }));
      toast({
        title: 'Training Failed',
        description: 'An error occurred during model training.',
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  const handleReset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">ML</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Pipeline Builder</h1>
              <p className="text-xs text-muted-foreground">No-code machine learning</p>
            </div>
          </div>
        </div>
      </header>

      {/* Pipeline Flow */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto">
          <PipelineFlow
            currentStage={state.currentStage}
            completedStages={state.completedStages}
            onStageClick={setStage}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {state.currentStage === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DatasetUpload
                dataset={state.dataset}
                onDatasetLoaded={handleDatasetLoaded}
                onNext={() => {
                  markStageComplete('upload');
                  setStage('preprocess');
                }}
              />
            </motion.div>
          )}

          {state.currentStage === 'preprocess' && (
            <motion.div
              key="preprocess"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PreprocessingConfig
                method={state.config.preprocessing}
                onMethodChange={(method) =>
                  setState(prev => ({
                    ...prev,
                    config: { ...prev.config, preprocessing: method },
                  }))
                }
                onNext={() => {
                  markStageComplete('preprocess');
                  setStage('split');
                }}
                onBack={() => setStage('upload')}
              />
            </motion.div>
          )}

          {state.currentStage === 'split' && state.dataset && (
            <motion.div
              key="split"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <TrainTestSplit
                dataset={state.dataset}
                splitRatio={state.config.splitRatio}
                targetColumn={state.config.targetColumn}
                featureColumns={state.config.featureColumns}
                onSplitRatioChange={(ratio) =>
                  setState(prev => ({
                    ...prev,
                    config: { ...prev.config, splitRatio: ratio },
                  }))
                }
                onTargetColumnChange={(column) =>
                  setState(prev => ({
                    ...prev,
                    config: {
                      ...prev.config,
                      targetColumn: column,
                      featureColumns: prev.config.featureColumns.filter(c => c !== column),
                    },
                  }))
                }
                onFeatureColumnsChange={(columns) =>
                  setState(prev => ({
                    ...prev,
                    config: { ...prev.config, featureColumns: columns },
                  }))
                }
                onNext={() => {
                  markStageComplete('split');
                  setStage('model');
                }}
                onBack={() => setStage('preprocess')}
              />
            </motion.div>
          )}

          {state.currentStage === 'model' && (
            <motion.div
              key="model"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ModelSelection
                model={state.config.modelType}
                onModelChange={(model) =>
                  setState(prev => ({
                    ...prev,
                    config: { ...prev.config, modelType: model },
                  }))
                }
                onTrain={handleTrain}
                onBack={() => setStage('split')}
                isProcessing={state.isProcessing}
              />
            </motion.div>
          )}

          {state.currentStage === 'results' && state.results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ResultsView
                results={state.results}
                modelType={state.config.modelType}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
