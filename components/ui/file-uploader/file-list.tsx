import React from "react";
import SortableList, { SortableItem } from "react-easy-sort";
import { arrayMoveImmutable } from "array-move";
import { FileCard } from "@/components/ui/file-uploader/file-card";
import { Separator } from "@/components/ui/separator";

export interface FileListProps {
  files: File[];
  removeFile: (index: number) => void;
  isSortable?: boolean;
  onFilesReorder?: (files: File[]) => void;
}

export function FileList({
  files,
  removeFile,
  onFilesReorder,
  isSortable,
}: FileListProps) {
  const handleSortEnd = (oldIndex: number, newIndex: number) => {
    const newFiles = arrayMoveImmutable(files, oldIndex, newIndex);
    if (onFilesReorder) {
      onFilesReorder(newFiles);
    }
  };

  return (
    files &&
    files.length > 0 && (
      <>
        <Separator />
        {isSortable ? (
          <SortableList
            onSortEnd={handleSortEnd}
            className="mt-4 flex flex-row flex-wrap items-center gap-4"
          >
            {files.map((file, index) => (
              <SortableItem key={index}>
                <FileCard
                  isSortable={isSortable}
                  file={file}
                  onRemove={() => removeFile(index)}
                />
              </SortableItem>
            ))}
          </SortableList>
        ) : (
          <div className="mt-4 flex flex-row flex-wrap items-center gap-4">
            {files.map((file, index) => (
              <FileCard
                isSortable={isSortable}
                key={index}
                file={file}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        )}
      </>
    )
  );
}
