import { motion } from 'framer-motion';
import { Database, Settings2, SplitSquareVertical, Brain, BarChart3, Check } from 'lucide-react';
import { PipelineStage } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface PipelineFlowProps {
  currentStage: PipelineStage;
  completedStages: PipelineStage[];
  onStageClick: (stage: PipelineStage) => void;
}

const stages: { id: PipelineStage; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'upload', label: 'Dataset', icon: Database, color: 'stage-data' },
  { id: 'preprocess', label: 'Preprocess', icon: Settings2, color: 'stage-preprocess' },
  { id: 'split', label: 'Split', icon: SplitSquareVertical, color: 'stage-split' },
  { id: 'model', label: 'Model', icon: Brain, color: 'stage-model' },
  { id: 'results', label: 'Results', icon: BarChart3, color: 'stage-results' },
];

export function PipelineFlow({ currentStage, completedStages, onStageClick }: PipelineFlowProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  return (
    <div className="w-full py-6 px-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {stages.map((stage, index) => {
          const isCompleted = completedStages.includes(stage.id);
          const isCurrent = stage.id === currentStage;
          const isClickable = isCompleted || index <= currentIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => isClickable && onStageClick(stage.id)}
                disabled={!isClickable}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300',
                  isClickable && 'cursor-pointer hover:bg-secondary/50',
                  !isClickable && 'opacity-40 cursor-not-allowed'
                )}
              >
                <div
                  className={cn(
                    'relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300',
                    isCurrent && 'ring-2 ring-offset-2 ring-offset-background',
                    isCompleted && !isCurrent && 'bg-secondary',
                    isCurrent && stage.color === 'stage-data' && 'bg-stage-data/20 ring-stage-data',
                    isCurrent && stage.color === 'stage-preprocess' && 'bg-stage-preprocess/20 ring-stage-preprocess',
                    isCurrent && stage.color === 'stage-split' && 'bg-stage-split/20 ring-stage-split',
                    isCurrent && stage.color === 'stage-model' && 'bg-stage-model/20 ring-stage-model',
                    isCurrent && stage.color === 'stage-results' && 'bg-stage-results/20 ring-stage-results',
                    !isCurrent && !isCompleted && 'bg-secondary/50'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-6 h-6 text-stage-results" />
                  ) : (
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isCurrent && stage.color === 'stage-data' && 'text-stage-data',
                        isCurrent && stage.color === 'stage-preprocess' && 'text-stage-preprocess',
                        isCurrent && stage.color === 'stage-split' && 'text-stage-split',
                        isCurrent && stage.color === 'stage-model' && 'text-stage-model',
                        isCurrent && stage.color === 'stage-results' && 'text-stage-results',
                        !isCurrent && 'text-muted-foreground'
                      )}
                    />
                  )}
                  {isCurrent && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={cn(
                        'absolute -bottom-1 w-2 h-2 rounded-full',
                        stage.color === 'stage-data' && 'bg-stage-data',
                        stage.color === 'stage-preprocess' && 'bg-stage-preprocess',
                        stage.color === 'stage-split' && 'bg-stage-split',
                        stage.color === 'stage-model' && 'bg-stage-model',
                        stage.color === 'stage-results' && 'bg-stage-results'
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {stage.label}
                </span>
              </motion.button>

              {index < stages.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 relative overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: index < currentIndex ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full',
                      'bg-gradient-to-r from-stage-data via-stage-preprocess to-stage-model'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
