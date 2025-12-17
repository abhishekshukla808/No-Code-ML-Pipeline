// ML Utility functions for preprocessing and model training

export interface DatasetInfo {
  data: number[][];
  columns: string[];
  rows: number;
  targetColumn: string | null;
  features: string[];
}

export interface ProcessedData {
  X_train: number[][];
  X_test: number[][];
  y_train: number[];
  y_test: number[];
}

// Standard Scaler: (x - mean) / std
export function standardScaler(data: number[][]): number[][] {
  if (data.length === 0) return data;
  
  const numFeatures = data[0].length;
  const means: number[] = [];
  const stds: number[] = [];
  
  // Calculate means
  for (let j = 0; j < numFeatures; j++) {
    const column = data.map(row => row[j]);
    const mean = column.reduce((a, b) => a + b, 0) / column.length;
    means.push(mean);
    
    // Calculate std
    const variance = column.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / column.length;
    stds.push(Math.sqrt(variance) || 1);
  }
  
  // Scale data
  return data.map(row => 
    row.map((val, j) => (val - means[j]) / stds[j])
  );
}

// Min-Max Scaler: (x - min) / (max - min)
export function minMaxScaler(data: number[][]): number[][] {
  if (data.length === 0) return data;
  
  const numFeatures = data[0].length;
  const mins: number[] = [];
  const maxs: number[] = [];
  
  for (let j = 0; j < numFeatures; j++) {
    const column = data.map(row => row[j]);
    mins.push(Math.min(...column));
    maxs.push(Math.max(...column));
  }
  
  return data.map(row =>
    row.map((val, j) => {
      const range = maxs[j] - mins[j];
      return range === 0 ? 0 : (val - mins[j]) / range;
    })
  );
}

// Train-Test Split
export function trainTestSplit(
  X: number[][],
  y: number[],
  testSize: number = 0.2,
  shuffle: boolean = true
): ProcessedData {
  const indices = Array.from({ length: X.length }, (_, i) => i);
  
  if (shuffle) {
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }
  
  const splitIndex = Math.floor(X.length * (1 - testSize));
  const trainIndices = indices.slice(0, splitIndex);
  const testIndices = indices.slice(splitIndex);
  
  return {
    X_train: trainIndices.map(i => X[i]),
    X_test: testIndices.map(i => X[i]),
    y_train: trainIndices.map(i => y[i]),
    y_test: testIndices.map(i => y[i]),
  };
}

// Sigmoid function
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))));
}

// Logistic Regression
export function logisticRegression(
  X_train: number[][],
  y_train: number[],
  learningRate: number = 0.1,
  iterations: number = 1000
): { weights: number[]; bias: number } {
  const numFeatures = X_train[0]?.length || 0;
  let weights = new Array(numFeatures).fill(0);
  let bias = 0;
  
  for (let iter = 0; iter < iterations; iter++) {
    const predictions = X_train.map(x => 
      sigmoid(x.reduce((sum, xi, i) => sum + xi * weights[i], 0) + bias)
    );
    
    // Calculate gradients
    const dw = new Array(numFeatures).fill(0);
    let db = 0;
    
    for (let i = 0; i < X_train.length; i++) {
      const error = predictions[i] - y_train[i];
      for (let j = 0; j < numFeatures; j++) {
        dw[j] += error * X_train[i][j];
      }
      db += error;
    }
    
    // Update weights
    for (let j = 0; j < numFeatures; j++) {
      weights[j] -= learningRate * dw[j] / X_train.length;
    }
    bias -= learningRate * db / X_train.length;
  }
  
  return { weights, bias };
}

export function predictLogistic(
  X: number[][],
  weights: number[],
  bias: number
): number[] {
  return X.map(x => {
    const prob = sigmoid(x.reduce((sum, xi, i) => sum + xi * weights[i], 0) + bias);
    return prob >= 0.5 ? 1 : 0;
  });
}

// Decision Tree Node
interface TreeNode {
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  prediction?: number;
}

// Gini impurity
function giniImpurity(y: number[]): number {
  if (y.length === 0) return 0;
  const counts: Record<number, number> = {};
  y.forEach(val => counts[val] = (counts[val] || 0) + 1);
  let impurity = 1;
  Object.values(counts).forEach(count => {
    const prob = count / y.length;
    impurity -= prob * prob;
  });
  return impurity;
}

// Decision Tree Classifier
export function decisionTreeClassifier(
  X_train: number[][],
  y_train: number[],
  maxDepth: number = 5,
  minSamplesSplit: number = 2
): TreeNode {
  function buildTree(X: number[][], y: number[], depth: number): TreeNode {
    // Base cases
    const uniqueLabels = [...new Set(y)];
    if (uniqueLabels.length === 1) {
      return { prediction: uniqueLabels[0] };
    }
    if (depth >= maxDepth || X.length < minSamplesSplit) {
      const counts: Record<number, number> = {};
      y.forEach(val => counts[val] = (counts[val] || 0) + 1);
      const prediction = Object.entries(counts).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0];
      return { prediction: parseInt(prediction) };
    }
    
    // Find best split
    let bestGain = 0;
    let bestFeature = 0;
    let bestThreshold = 0;
    const currentImpurity = giniImpurity(y);
    
    const numFeatures = X[0]?.length || 0;
    for (let feature = 0; feature < numFeatures; feature++) {
      const values = [...new Set(X.map(row => row[feature]))].sort((a, b) => a - b);
      
      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;
        const leftIndices: number[] = [];
        const rightIndices: number[] = [];
        
        X.forEach((row, idx) => {
          if (row[feature] <= threshold) {
            leftIndices.push(idx);
          } else {
            rightIndices.push(idx);
          }
        });
        
        if (leftIndices.length === 0 || rightIndices.length === 0) continue;
        
        const leftY = leftIndices.map(i => y[i]);
        const rightY = rightIndices.map(i => y[i]);
        
        const gain = currentImpurity - 
          (leftY.length / y.length) * giniImpurity(leftY) -
          (rightY.length / y.length) * giniImpurity(rightY);
        
        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
        }
      }
    }
    
    if (bestGain === 0) {
      const counts: Record<number, number> = {};
      y.forEach(val => counts[val] = (counts[val] || 0) + 1);
      const prediction = Object.entries(counts).reduce((a, b) => 
        a[1] > b[1] ? a : b
      )[0];
      return { prediction: parseInt(prediction) };
    }
    
    const leftIndices: number[] = [];
    const rightIndices: number[] = [];
    X.forEach((row, idx) => {
      if (row[bestFeature] <= bestThreshold) {
        leftIndices.push(idx);
      } else {
        rightIndices.push(idx);
      }
    });
    
    return {
      feature: bestFeature,
      threshold: bestThreshold,
      left: buildTree(
        leftIndices.map(i => X[i]),
        leftIndices.map(i => y[i]),
        depth + 1
      ),
      right: buildTree(
        rightIndices.map(i => X[i]),
        rightIndices.map(i => y[i]),
        depth + 1
      ),
    };
  }
  
  return buildTree(X_train, y_train, 0);
}

export function predictDecisionTree(X: number[][], tree: TreeNode): number[] {
  function predictSingle(x: number[], node: TreeNode): number {
    if (node.prediction !== undefined) {
      return node.prediction;
    }
    if (x[node.feature!] <= node.threshold!) {
      return predictSingle(x, node.left!);
    }
    return predictSingle(x, node.right!);
  }
  
  return X.map(x => predictSingle(x, tree));
}

// Calculate accuracy
export function calculateAccuracy(yTrue: number[], yPred: number[]): number {
  if (yTrue.length === 0) return 0;
  const correct = yTrue.filter((val, i) => val === yPred[i]).length;
  return correct / yTrue.length;
}

// Calculate confusion matrix
export function confusionMatrix(yTrue: number[], yPred: number[]): number[][] {
  const labels = [...new Set([...yTrue, ...yPred])].sort((a, b) => a - b);
  const matrix = labels.map(() => labels.map(() => 0));
  
  yTrue.forEach((actual, i) => {
    const predicted = yPred[i];
    const actualIdx = labels.indexOf(actual);
    const predictedIdx = labels.indexOf(predicted);
    matrix[actualIdx][predictedIdx]++;
  });
  
  return matrix;
}
