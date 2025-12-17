import { motion } from 'framer-motion';
import { Brain, ChevronLeft, Play, TreeDeciduous, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ModelType } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface ModelSelectionProps {
  model: ModelType;
  onModelChange: (model: ModelType) => void;
  onTrain: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

const models: { id: ModelType; name: string; description: string; icon: React.ElementType; details: string[] }[] = [
  {
    id: 'logistic',
    name: 'Logistic Regression',
    description: 'A linear model for binary classification using the logistic function',
    icon: TrendingUp,
    details: [
      'Best for: Binary classification problems',
      'Fast training and prediction',
      'Provides probability outputs',
      'Works well with linearly separable data',
    ],
  },
  {
    id: 'decision_tree',
    name: 'Decision Tree Classifier',
    description: 'A tree-based model that learns decision rules from features',
    icon: TreeDeciduous,
    details: [
      'Best for: Non-linear decision boundaries',
      'Easy to interpret and visualize',
      'Handles both numerical and categorical data',
      'No feature scaling required',
    ],
  },
];

export function ModelSelection({ model, onModelChange, onTrain, onBack, isProcessing }: ModelSelectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Select Model</h2>
        <p className="text-muted-foreground">
          Choose a machine learning model to train on your data
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {models.map((m, index) => {
          const Icon = m.icon;
          const isSelected = model === m.id;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'p-5 cursor-pointer transition-all duration-300 border-2 h-full',
                  isSelected
                    ? 'border-stage-model glow-model bg-stage-model/5'
                    : 'border-transparent hover:border-border hover:bg-secondary/30'
                )}
                onClick={() => onModelChange(m.id)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                      isSelected ? 'bg-stage-model/20' : 'bg-secondary'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isSelected ? 'text-stage-model' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{m.name}</h3>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-2 py-0.5 rounded-full bg-stage-model/20 text-stage-model text-xs font-medium"
                        >
                          Selected
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  {m.details.map((detail, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                        isSelected ? 'bg-stage-model' : 'bg-muted-foreground'
                      )} />
                      <span className="text-muted-foreground">{detail}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Train Button */}
      <Card className="p-6 bg-gradient-to-r from-stage-model/10 to-stage-results/10 border-stage-model/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stage-model/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-stage-model" />
            </div>
            <div>
              <h3 className="font-semibold">Ready to Train</h3>
              <p className="text-sm text-muted-foreground">
                Your pipeline is configured and ready to run
              </p>
            </div>
          </div>
          <Button
            onClick={onTrain}
            disabled={isProcessing}
            size="lg"
            className="gap-2 bg-stage-model hover:bg-stage-model/90 min-w-[140px]"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                Training...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Train Model
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      </div>
    </motion.div>
  );
}
