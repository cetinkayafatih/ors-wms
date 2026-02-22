'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScanLine, X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

export function BarcodeScanner({
  onScan,
  trigger,
  title = 'Barkod Tara',
  description = 'Kamera ile barkod veya QR kod tarayin',
}: BarcodeScannerProps) {
  const [open, setOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!open) {
      setScannedCode(null);
      return;
    }

    const timer = setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'barcode-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_39,
          ],
          rememberLastUsedCamera: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          setScannedCode(decodedText);
          onScan(decodedText);
          scanner.clear().catch(() => {});
          setOpen(false);
        },
        () => {}
      );

      scannerRef.current = scanner;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [open, onScan]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <ScanLine className="mr-2 size-4" />
            Barkod Tara
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <div id="barcode-reader" className="w-full" />
          {scannedCode && (
            <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-800">
              Taranan kod: <strong>{scannedCode}</strong>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            <X className="mr-2 size-4" />
            Kapat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ManualBarcodeInputProps {
  onSubmit: (code: string) => void;
  placeholder?: string;
}

export function ManualBarcodeInput({
  onSubmit,
  placeholder = 'Barkod veya SKU girin...',
}: ManualBarcodeInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        autoComplete="off"
      />
      <Button type="submit" size="sm" disabled={!value.trim()}>
        Ara
      </Button>
    </form>
  );
}
