/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-11-15 14:10:43
 * @ Modified time: 2025-12-08 12:49:40
 * @ Description:
 *
 * Allows previewing a form and some fields on that form.
 */

import "./react-pdf-highlighter.css";
import { Loader } from "@/components/ui/loader";
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
  documentUrl,
  highlights,
  previews,
  onHighlightFinished,
}: {
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
    <div className="">
      <PdfDecorator>
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
const PdfDecorator = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full flex-col gap-0">
      <div className="flex-1">{children}</div>
    </div>
  );
};
