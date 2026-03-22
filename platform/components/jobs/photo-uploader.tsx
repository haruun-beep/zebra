"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  jobId: string;
  photos: Record<string, unknown>[];
  onUpload: (photo: Record<string, unknown>) => void;
}

export function PhotoUploader({ jobId, photos, onUpload }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("jobId", jobId);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (res.ok) {
          onUpload(data.photo);
          toast.success("Photo uploaded");
        } else {
          toast.error(data.error ?? "Upload failed");
        }
      }
      setUploading(false);
    },
    [jobId, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <div className="space-y-4">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id as string} className="relative aspect-square">
              <img
                src={photo.url as string}
                alt={(photo.caption as string) ?? "Job photo"}
                className="w-full h-full object-cover rounded-md border"
              />
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary hover:bg-accent"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Uploading...
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? "Drop photos here" : "Drag & drop or click to upload photos"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
