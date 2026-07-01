"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, X, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  existingUrl?: string;
  onClearExisting?: () => void;
  className?: string;
}

export function FileUploader({
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
  existingUrl,
  onClearExisting,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB`);
      return;
    }
    if (accept && accept !== "*") {
      const isAccepted = accept.split(",").some((type) => {
        const t = type.trim();
        if (t.endsWith("/*")) {
          const base = t.replace("/*", "");
          return file.type.startsWith(base);
        }
        return file.type === t || file.name.endsWith(t);
      });
      if (!isAccepted) {
        setError(`Invalid file type. Accepted: ${accept}`);
        return;
      }
    }
    onChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearFile = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
  };

  if (value) {
    const isImage = value.type.startsWith("image/");
    const objectUrl = isImage ? URL.createObjectURL(value) : null;

    return (
      <div className={cn("relative rounded-xl border border-border overflow-hidden group bg-muted/30", className)}>
        {isImage && objectUrl ? (
          <div className="relative w-full h-40 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={objectUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <Button type="button" variant="destructive" size="sm" onClick={clearFile}>
                Remove File
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <FileIcon className="w-8 h-8 text-brand flex-shrink-0" />
              <div className="truncate">
                <p className="text-sm font-medium truncate">{value.name}</p>
                <p className="text-xs text-muted-foreground">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={clearFile}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (existingUrl) {
    return (
      <div className={cn("relative rounded-xl border border-border overflow-hidden group bg-muted/30", className)}>
        <div className="relative w-full h-40 flex items-center justify-center">
           {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={existingUrl} alt="Current" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            {onClearExisting && (
              <Button type="button" variant="destructive" size="sm" onClick={onClearExisting} className="ml-2">
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          type="file"
          ref={inputRef}
          accept={accept}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
          }}
        />
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors text-center",
        isDragging ? "border-brand bg-brand/5" : "border-border hover:border-brand/50 hover:bg-muted/50",
        error ? "border-destructive/50 bg-destructive/5" : "",
        className
      )}
    >
      <div className={cn("p-3 rounded-full", isDragging ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground")}>
        <UploadCloud className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium">Click or drag file to upload</p>
        <p className="text-xs text-muted-foreground mt-1">
          Supported formats: {accept.replace(/\*/g, 'any')} (Max {maxSizeMB}MB)
        </p>
      </div>
      {error && <p className="text-sm text-destructive font-medium mt-1">{error}</p>}
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
        }}
      />
    </div>
  );
}
