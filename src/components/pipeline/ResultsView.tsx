import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Clock, Database, RotateCcw, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrainingResults, ModelType } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface ResultsViewProps {
  results: TrainingResults;
  modelType: ModelType;
  onReset: () => void;
}

export function ResultsView({ results, modelType, onReset }: ResultsViewProps) {
  const modelName = modelType === 'logistic' ? 'Logistic Regression' : 'Decision Tree';
  const accuracyPercent = (results.accuracy * 100).toFixed(2);
  const trainAccuracyPercent = (results.trainAccuracy * 100).toFixed(2);

  // Confusion matrix labels
  const labels = ['Class 0', 'Class 1'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-stage-results/20 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-stage-results" />
        </motion.div>
        <h2 className="text-2xl font-semibold mb-2">Training Complete</h2>
        <p className="text-muted-foreground">
          Your {modelName} model has been trained successfully
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 glow-results border-stage-results/30 text-center">
            <div className="w-12 h-12 rounded-xl bg-stage-results/20 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-stage-results" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Test Accuracy</p>
            <p className="text-3xl font-bold text-stage-results">{accuracyPercent}%</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Train Accuracy</p>
            <p className="text-3xl font-bold">{trainAccuracyPercent}%</p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5 text-center">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Training Time</p>
            <p className="text-3xl font-bold">{results.trainingTime}ms</p>
          </Card>
        </motion.div>
      </div>

      {/* Data Split Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-medium">Data Split Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-stage-data/10">
              <span className="text-sm text-muted-foreground">Training Samples</span>
              <span className="font-semibold">{results.trainSize.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-stage-split/10">
              <span className="text-sm text-muted-foreground">Test Samples</span>
              <span className="font-semibold">{results.testSize.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Confusion Matrix */}
      {results.confusionMatrix.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-5">
            <h3 className="font-medium mb-4">Confusion Matrix</h3>
            <div className="flex justify-center">
              <div className="inline-block">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-xs text-muted-foreground mr-2">Predicted →</span>
                </div>
                <div className="flex">
                  <div className="flex flex-col justify-center mr-2">
                    <span className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">Actual ↓</span>
                  </div>
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="w-20"></th>
                        {labels.slice(0, results.confusionMatrix[0]?.length || 2).map((label, i) => (
                          <th key={i} className="w-20 p-2 text-xs font-medium text-muted-foreground">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.confusionMatrix.map((row, i) => (
                        <tr key={i}>
                          <td className="p-2 text-xs font-medium text-muted-foreground text-right pr-4">
                            {labels[i]}
                          </td>
                          {row.map((cell, j) => {
                            const isDiagonal = i === j;
                            const total = results.confusionMatrix.flat().reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? (cell / total) * 100 : 0;

                            return (
                              <td key={j} className="p-1">
                                <div
                                  className={cn(
                                    'w-20 h-16 rounded-lg flex flex-col items-center justify-center transition-colors',
                                    isDiagonal
                                      ? 'bg-stage-results/20 border border-stage-results/40'
                                      : 'bg-destructive/10 border border-destructive/20'
                                  )}
                                >
                                  <span className="text-xl font-bold">{cell}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Accuracy Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-5">
          <h3 className="font-medium mb-4">Model Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Test Accuracy</span>
                <span className="font-medium text-stage-results">{accuracyPercent}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${results.accuracy * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-stage-results rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Train Accuracy</span>
                <span className="font-medium">{trainAccuracyPercent}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${results.trainAccuracy * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Reset Button */}
      <div className="flex justify-center pt-4">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Start New Pipeline
        </Button>
      </div>
    </motion.div>
  );
}
