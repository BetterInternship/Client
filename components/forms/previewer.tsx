/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-11-15 14:10:43
 * @ Modified time: 2025-11-16 03:35:50
 * @ Description:
 *
 * Allows previewing a form and some fields on that form.
 */

import "./react-pdf-highlighter.css";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";
import {
  AreaHighlight,
  Comment,
  Content,
  IHighlight,
  PdfHighlighter,
  PdfLoader,
  Popup,
  ScaledPosition,
  ViewportHighlight,
} from "react-pdf-highlighter";

/**
 * Represents the transform of a simple object on the document.
 */
export interface DocumentObjectTransform {
  x: number;
  y: number;
  w: number;
  h: number;
  page: number;
}

/**
 * Rename it in case we want to extend this in the future.
 */
export type DocumentHighlight = IHighlight;

/**
 * A component that just renders the document itself.
 *
 * @component
 */
export const DocumentRenderer = ({
  documentName,
  documentUrl,
  highlights,
  previews,
  onHighlightFinished,
}: {
  documentName?: string;
  documentUrl: string;
  highlights?: IHighlight[];
  previews?: Record<number, React.ReactNode[]>;
  onHighlightFinished?: (
    highlight: DocumentHighlight,
    transform: DocumentObjectTransform,
  ) => void;
}) => {
  // Triggered when highlighting is finished
  const onSelectionFinished = (position: ScaledPosition, content: Content) => {
    const newHighlight: DocumentHighlight = {
      id: "highlight",
      content: content,
      position: position,
      comment: { text: "", emoji: "" } as unknown as Comment,
    };

    // Set bounding rect to display
    const boundingRect = position.boundingRect;
    const newTransform: DocumentObjectTransform = {
      x: ~~boundingRect.x1,
      y: ~~boundingRect.y1,
      w: ~~boundingRect.x2 - ~~boundingRect.x1,
      h: ~~boundingRect.y2 - ~~boundingRect.y1,
      page: position.pageNumber,
    };

    // Call the external listener
    onHighlightFinished?.(newHighlight, newTransform);

    // Maybe in the future you want to return a component to render per highlight
    // Do it here
    return null;
  };

  // Renders a highlight object into a component
  const highlightRenderer = (highlight: ViewportHighlight, index: number) => (
    <Popup
      popupContent={<></>}
      onMouseOver={() => {}}
      onMouseOut={() => {}}
      key={index}
    >
      <AreaHighlight
        highlight={highlight}
        onChange={() => {}}
        isScrolledTo={false}
      />
    </Popup>
  );

  // Create previews for the provided object previews
  const createPreviews = (
    paginatedPreviews: Record<number, React.ReactNode[]>,
  ) => {
    const previews = [];
    const pages = Object.keys(paginatedPreviews);
    const fieldPreviewContainers =
      document.querySelectorAll(".PdfHighlighter__highlight-layer") ?? [];

    // Push the previews to the container
    for (let i = 0; i < pages.length; i++) {
      const page = parseInt(pages[i]);
      const previewContainer = fieldPreviewContainers[page - 1];
      if (!previewContainer) continue;

      for (const object of paginatedPreviews[page])
        previews.push(createPortal(object, previewContainer));
    }

    return previews;
  };

  // No document to show
  if (!documentUrl) return <></>;

  return (
    <div>
      <PdfDecorator title={documentName ?? "No Name Specified"}>
        <PdfLoader url={documentUrl} beforeLoad={<Loader />}>
          {(pdfDocument) => (
            <PdfHighlighter
              pdfDocument={pdfDocument}
              enableAreaSelection={(event) => true}
              onScrollChange={() => {}}
              scrollRef={() => {}}
              highlightTransform={highlightRenderer}
              highlights={highlights ?? []}
              onSelectionFinished={onSelectionFinished}
            />
          )}
        </PdfLoader>
      </PdfDecorator>
      {previews && createPreviews(previews)}
    </div>
  );
};

/**
 * Makes the pdf look better.
 *
 * @component
 */
const PdfDecorator = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-full flex-col gap-0">
      <div className="flex h-16 flex-col justify-center text-2xl font-bold tracking-tight">
        {title}
      </div>
      <div className="relative flex-1">{children}</div>
      <div className="h-16"></div>
    </div>
  );
};

/**
 * A preview of what the field will look like on the document.
 *
 * @component
 */
const FieldPreview = ({
  value,
  x,
  y,
  w,
  h,
}: {
  value: string;
  x: number;
  y: number;
  w: number;
  h: number;
}) => {
  return (
    <div
      className={cn("absolute top-0 left-0 border-0! bg-primary/10")}
      style={{
        userSelect: "auto",
        display: "inline-block",
        width: `round(var(--scale-factor) * ${w}px, 1px)`,
        height: `round(var(--scale-factor) * ${h}px, 1px)`,
        fontSize: "12px",
        transform: `translate(round(var(--scale-factor) * ${x}px, 1px), round(var(--scale-factor) * ${y}px, 1px))`,
        boxSizing: "border-box",
        cursor: "pointer",
        flexShrink: "0",
      }}
    >
      {value}
    </div>
  );
};
