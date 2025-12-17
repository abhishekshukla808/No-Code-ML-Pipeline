import { motion } from 'framer-motion';
import { Settings2, ChevronRight, ChevronLeft, Sparkles, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PreprocessingMethod } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface PreprocessingConfigProps {
  method: PreprocessingMethod;
  onMethodChange: (method: PreprocessingMethod) => void;
  onNext: () => void;
  onBack: () => void;
}

const methods: { id: PreprocessingMethod; name: string; description: string; icon: React.ElementType }[] = [
  {
    id: 'none',
    name: 'No Preprocessing',
    description: 'Use raw data without any scaling or normalization',
    icon: Settings2,
  },
  {
    id: 'standard',
    name: 'Standard Scaler',
    description: 'Standardize features by removing the mean and scaling to unit variance',
    icon: Scale,
  },
  {
    id: 'minmax',
    name: 'Min-Max Scaler',
    description: 'Scale features to a range between 0 and 1',
    icon: Sparkles,
  },
];

export function PreprocessingConfig({ method, onMethodChange, onNext, onBack }: PreprocessingConfigProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Data Preprocessing</h2>
        <p className="text-muted-foreground">
          Choose how to scale and normalize your features
        </p>
      </div>

      <div className="grid gap-4">
        {methods.map((m, index) => {
          const Icon = m.icon;
          const isSelected = method === m.id;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  'p-5 cursor-pointer transition-all duration-300 border-2',
                  isSelected
                    ? 'border-stage-preprocess glow-preprocess bg-stage-preprocess/5'
                    : 'border-transparent hover:border-border hover:bg-secondary/30'
                )}
                onClick={() => onMethodChange(m.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                      isSelected ? 'bg-stage-preprocess/20' : 'bg-secondary'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isSelected ? 'text-stage-preprocess' : 'text-muted-foreground'
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
                          className="px-2 py-0.5 rounded-full bg-stage-preprocess/20 text-stage-preprocess text-xs font-medium"
                        >
                          Selected
                        </motion.span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </div>
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      isSelected ? 'border-stage-preprocess bg-stage-preprocess' : 'border-muted-foreground'
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-background"
                      />
                    )}
                  </div>
                </div>

                {isSelected && m.id !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs">
                      {m.id === 'standard' && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground"># Formula:</p>
                          <p className="text-stage-preprocess">z = (x - μ) / σ</p>
                          <p className="text-muted-foreground mt-2"># Where μ is mean, σ is standard deviation</p>
                        </div>
                      )}
                      {m.id === 'minmax' && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground"># Formula:</p>
                          <p className="text-stage-preprocess">x_scaled = (x - min) / (max - min)</p>
                          <p className="text-muted-foreground mt-2"># Scales values to range [0, 1]</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} className="gap-2 bg-stage-preprocess hover:bg-stage-preprocess/90 text-primary-foreground">
          Continue to Split
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
