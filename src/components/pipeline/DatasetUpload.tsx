import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, Table2, ChevronRight } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dataset, DatasetColumn } from '@/types/pipeline';
import { cn } from '@/lib/utils';

interface DatasetUploadProps {
  dataset: Dataset | null;
  onDatasetLoaded: (dataset: Dataset) => void;
  onNext: () => void;
}

export function DatasetUpload({ dataset, onDatasetLoaded, onNext }: DatasetUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const processData = useCallback((data: Record<string, unknown>[], fileName: string) => {
    if (data.length === 0) {
      setError('The file appears to be empty');
      return;
    }

    const columns: DatasetColumn[] = Object.keys(data[0]).map(name => {
      const sampleValues = data.slice(0, 5).map(row => row[name] as string | number);
      const numericCount = sampleValues.filter(v => !isNaN(Number(v)) && v !== '').length;
      const type = numericCount >= sampleValues.length * 0.8 ? 'numeric' : 'categorical';
      return { name, type, sampleValues };
    });

    // Convert to numeric matrix (only numeric columns)
    const numericColumns = columns.filter(c => c.type === 'numeric');
    const numericData = data.map(row => 
      numericColumns.map(col => {
        const val = Number(row[col.name]);
        return isNaN(val) ? 0 : val;
      })
    );

    const dataset: Dataset = {
      rawData: data,
      numericData,
      columns,
      rows: data.length,
      fileName,
    };

    onDatasetLoaded(dataset);
    setError(null);
  }, [onDatasetLoaded]);

  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processData(results.data as Record<string, unknown>[], file.name);
            setIsLoading(false);
          },
          error: (err) => {
            setError(`Failed to parse CSV: ${err.message}`);
            setIsLoading(false);
          },
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);
        processData(data as Record<string, unknown>[], file.name);
        setIsLoading(false);
      } else {
        setError('Unsupported file format. Please upload a CSV or Excel file.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to read file. Please check the file format.');
      setIsLoading(false);
    }
  }, [processData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Upload Your Dataset</h2>
        <p className="text-muted-foreground">
          Upload a CSV or Excel file to begin building your ML pipeline
        </p>
      </div>

      {!dataset ? (
        <Card
          className={cn(
            'relative border-2 border-dashed transition-all duration-300 cursor-pointer',
            isDragging ? 'border-stage-data bg-stage-data/5' : 'border-border hover:border-stage-data/50',
            error && 'border-destructive'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center p-12 cursor-pointer">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
            />
            <motion.div
              animate={{ scale: isDragging ? 1.1 : 1 }}
              className={cn(
                'w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-colors',
                isDragging ? 'bg-stage-data/20' : 'bg-secondary'
              )}
            >
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-stage-data border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className={cn('w-10 h-10', isDragging ? 'text-stage-data' : 'text-muted-foreground')} />
              )}
            </motion.div>
            <p className="text-lg font-medium mb-1">
              {isDragging ? 'Drop your file here' : 'Drag & drop your dataset'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">.csv</span>
              <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">.xlsx</span>
              <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">.xls</span>
            </div>
          </label>
        </Card>
      ) : (
        <Card className="p-6 glow-data border-stage-data/30">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-stage-data/20 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-stage-data" />
              </div>
              <div>
                <h3 className="font-semibold">{dataset.fileName}</h3>
                <p className="text-sm text-muted-foreground">
                  {dataset.rows.toLocaleString()} rows × {dataset.columns.length} columns
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDatasetLoaded(null as unknown as Dataset)}
              className="text-muted-foreground hover:text-destructive"
            >
              Remove
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Table2 className="w-4 h-4" />
              Column Preview
            </h4>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="data-table">
                <thead>
                  <tr>
                    {dataset.columns.slice(0, 6).map(col => (
                      <th key={col.name}>
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[100px]">{col.name}</span>
                          <span className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide',
                            col.type === 'numeric' ? 'bg-stage-data/20 text-stage-data' : 'bg-stage-preprocess/20 text-stage-preprocess'
                          )}>
                            {col.type}
                          </span>
                        </div>
                      </th>
                    ))}
                    {dataset.columns.length > 6 && (
                      <th className="text-muted-foreground">+{dataset.columns.length - 6} more</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {dataset.rawData.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {dataset.columns.slice(0, 6).map(col => (
                        <td key={col.name} className="truncate max-w-[120px]">
                          {String(row[col.name] ?? '')}
                        </td>
                      ))}
                      {dataset.columns.length > 6 && <td className="text-muted-foreground">...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {dataset.rows > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing first 5 of {dataset.rows.toLocaleString()} rows
              </p>
            )}
          </div>
        </Card>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {dataset && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="gap-2 bg-stage-data hover:bg-stage-data/90">
            Continue to Preprocessing
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}
