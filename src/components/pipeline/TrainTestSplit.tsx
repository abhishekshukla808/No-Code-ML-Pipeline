import { motion } from 'framer-motion';
import { SplitSquareVertical, ChevronRight, ChevronLeft, Target, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dataset } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface TrainTestSplitProps {
  dataset: Dataset;
  splitRatio: number;
  targetColumn: string | null;
  featureColumns: string[];
  onSplitRatioChange: (ratio: number) => void;
  onTargetColumnChange: (column: string) => void;
  onFeatureColumnsChange: (columns: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TrainTestSplit({
  dataset,
  splitRatio,
  targetColumn,
  featureColumns,
  onSplitRatioChange,
  onTargetColumnChange,
  onFeatureColumnsChange,
  onNext,
  onBack,
}: TrainTestSplitProps) {
  const numericColumns = dataset.columns.filter(c => c.type === 'numeric');
  const trainSize = Math.floor(dataset.rows * (1 - splitRatio));
  const testSize = dataset.rows - trainSize;

  const toggleFeatureColumn = (colName: string) => {
    if (colName === targetColumn) return;
    if (featureColumns.includes(colName)) {
      onFeatureColumnsChange(featureColumns.filter(c => c !== colName));
    } else {
      onFeatureColumnsChange([...featureColumns, colName]);
    }
  };

  const selectAllFeatures = () => {
    onFeatureColumnsChange(numericColumns.filter(c => c.name !== targetColumn).map(c => c.name));
  };

  const canContinue = targetColumn && featureColumns.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Train-Test Split</h2>
        <p className="text-muted-foreground">
          Configure how to split your data for training and testing
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Target Column Selection */}
        <Card className="p-5 border-stage-split/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-stage-split/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-stage-split" />
            </div>
            <div>
              <h3 className="font-medium">Target Column</h3>
              <p className="text-xs text-muted-foreground">Variable to predict</p>
            </div>
          </div>
          <Select value={targetColumn || ''} onValueChange={onTargetColumnChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select target column" />
            </SelectTrigger>
            <SelectContent>
              {numericColumns.map(col => (
                <SelectItem key={col.name} value={col.name}>
                  {col.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Split Ratio */}
        <Card className="p-5 border-stage-split/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-stage-split/20 flex items-center justify-center">
              <SplitSquareVertical className="w-5 h-5 text-stage-split" />
            </div>
            <div>
              <h3 className="font-medium">Split Ratio</h3>
              <p className="text-xs text-muted-foreground">Train vs Test distribution</p>
            </div>
          </div>
          <div className="space-y-4">
            <Slider
              value={[splitRatio * 100]}
              onValueChange={([val]) => onSplitRatioChange(val / 100)}
              min={10}
              max={50}
              step={5}
              className="py-2"
            />
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-stage-data" />
                <span>Train: {Math.round((1 - splitRatio) * 100)}%</span>
                <span className="text-muted-foreground">({trainSize.toLocaleString()} rows)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-stage-split" />
                <span>Test: {Math.round(splitRatio * 100)}%</span>
                <span className="text-muted-foreground">({testSize.toLocaleString()} rows)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Feature Selection */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Columns className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">Feature Columns</h3>
              <p className="text-xs text-muted-foreground">
                Select columns to use as input features ({featureColumns.length} selected)
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={selectAllFeatures}>
            Select All
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {numericColumns.map(col => {
            const isTarget = col.name === targetColumn;
            const isSelected = featureColumns.includes(col.name);

            return (
              <button
                key={col.name}
                onClick={() => toggleFeatureColumn(col.name)}
                disabled={isTarget}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all border',
                  isTarget && 'opacity-40 cursor-not-allowed bg-stage-split/20 border-stage-split text-stage-split',
                  !isTarget && isSelected && 'bg-primary/20 border-primary text-primary',
                  !isTarget && !isSelected && 'bg-secondary border-transparent text-muted-foreground hover:border-border'
                )}
              >
                {col.name}
                {isTarget && ' (target)'}
              </button>
            );
          })}
        </div>
        {numericColumns.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No numeric columns found in dataset
          </p>
        )}
      </Card>

      {/* Visual Split Preview */}
      <Card className="p-5 bg-secondary/30">
        <h4 className="text-sm font-medium mb-3">Data Split Preview</h4>
        <div className="flex h-8 rounded-lg overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(1 - splitRatio) * 100}%` }}
            className="bg-stage-data flex items-center justify-center"
          >
            <span className="text-xs font-medium text-primary-foreground">
              Training Data
            </span>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${splitRatio * 100}%` }}
            className="bg-stage-split flex items-center justify-center"
          >
            <span className="text-xs font-medium text-foreground">
              Test Data
            </span>
          </motion.div>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="gap-2 bg-stage-split hover:bg-stage-split/90"
        >
          Continue to Model
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
