'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  message?: string;
  retry?: () => void;
}

export function ErrorDisplay({
  message = 'Bir hata olustu. Lutfen tekrar deneyin.',
  retry,
}: ErrorDisplayProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
      <AlertCircle className="size-12 text-destructive" />
      <h3 className="mt-4 text-lg font-semibold text-destructive">Hata</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{message}</p>
      {retry && (
        <Button variant="outline" className="mt-6" onClick={retry}>
          Tekrar Dene
        </Button>
      )}
    </div>
  );
}
