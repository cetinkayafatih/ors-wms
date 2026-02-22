'use client';

import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet } from 'lucide-react';

interface ExportButtonsProps {
  onExportPDF?: () => void;
  onExportExcel?: () => void;
  pdfLabel?: string;
  excelLabel?: string;
}

export function ExportButtons({
  onExportPDF,
  onExportExcel,
  pdfLabel = 'PDF',
  excelLabel = 'Excel',
}: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      {onExportPDF && (
        <Button variant="outline" size="sm" onClick={onExportPDF}>
          <FileText className="mr-1.5 size-4" />
          {pdfLabel}
        </Button>
      )}
      {onExportExcel && (
        <Button variant="outline" size="sm" onClick={onExportExcel}>
          <FileSpreadsheet className="mr-1.5 size-4" />
          {excelLabel}
        </Button>
      )}
    </div>
  );
}
