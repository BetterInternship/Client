/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-11-09 03:19:04
 * @ Modified time: 2025-12-23 00:31:57
 * @ Description:
 *
 * We can move this out later on so it becomes reusable in other places.
 * This allows the consumer to use information about a form within the component.
 * This is the form context used by a form renderer.
 */

import {
  ClientField,
  ClientPhantomField,
  ServerField,
  FormMetadata,
  IFormMetadata,
  IFormParameters,
  ClientBlock,
} from "@betterinternship/core/forms";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { FormService } from "@/lib/api/services";

// ? Current schema version, update if needed; tells us if out of date
export const SCHEMA_VERSION = 1;

// Context interface
export interface IFormRendererContext {
  formName: string;
  formVersion: number;
  formMetadata: FormMetadata<[]>;
  document: IDocument;
  fields: (ClientField<[]> | ClientPhantomField<[]>)[];
  blocks: ClientBlock<[]>[];
  params: IFormParameters;
  keyedFields: (ServerField & { _id: string })[];
  previews: Record<number, React.ReactNode[]>;
  loading: boolean;
  selectedPreviewId: string | null;
  setSelectedPreviewId: (id: string | null) => void;

  // Setters
  updateFormName: (newFormName: string) => void;
  refreshPreviews: () => void;
}

interface IDocument {
  name: string;
  url: string;
}

// Context defs
const FormRendererContext = createContext<IFormRendererContext>(
  {} as IFormRendererContext,
);
export const useFormRendererContext = () => useContext(FormRendererContext);

/**
 * Gives access to form context api
 *
 * @component
 * @provider
 */
export const FormRendererContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Define state here
  const [documentName, setDocumentName] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formVersion, setFormVersion] = useState<number>(0);
  const [previewFields, setPreviewFields] = useState<ServerField[]>([]);
  const [blocks, setBlocks] = useState<ClientBlock<[]>[]>([]);
  const [fields, setFields] = useState<ClientField<[]>[]>([]);
  const [params, setParams] = useState<IFormParameters>({});
  const [previews, setPreviews] = useState<Record<number, React.ReactNode[]>>(
    {},
  );
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>("");

  // Used in the ui for selecting / distinguishing fields
  const keyedFields = useMemo(
    () =>
      previewFields.map((field) => ({
        _id: Math.random().toString(),
        ...field,
      })),
    [previewFields],
  );

  // Default form metadata
  const initialFormMetadata: IFormMetadata = {
    name: "",
    label: "",
    schema_version: SCHEMA_VERSION,
    schema: { blocks: [] },
    subscribers: [],
    signing_parties: [],
  };
  const [formMetadata, setFormMetadata] = useState<FormMetadata<[]>>(
    new FormMetadata(initialFormMetadata),
  );

  // Loading states
  const [loading, setLoading] = useState(false);

  // Refresh previews of the different fields
  const refreshPreviews = () => {
    const newPreviews: Record<number, React.ReactNode[]> = {};

    // Push new previews here
    keyedFields.forEach((field) => {
      if (!newPreviews[field.page]) newPreviews[field.page] = [];
      newPreviews[field.page].push(
        <FieldPreview
          key={field._id}
          field={field.field}
          x={field.x}
          y={field.y}
          w={field.w}
          h={field.h}
          selected={field._id === selectedPreviewId}
          onClick={() => setSelectedPreviewId(field._id)}
        />,
      );
    });

    setPreviews(newPreviews);
  };

  // When form name and version are updated, pull latest
  useEffect(() => {
    if (!formName || (!formVersion && formVersion !== 0)) return;
    const controller = new AbortController();

    void FormService.getForm(formName)
      .then((form) => {
        const fm = new FormMetadata(form.formMetadata);
        const newFormName = form.formMetadata.name;
        const newFormVersion = form.formMetadata.schema_version;

        // Only update form if it's new
        if (formName !== newFormName || formVersion !== newFormVersion) {
          setFormMetadata(fm);
          setFormName(newFormName);
          setFormVersion(newFormVersion);
          setDocumentName(form.formDocument.name);
          setDocumentUrl(form.documentUrl);
          setFields(fm.getFieldsForClientService());
          setBlocks(fm.getAllBlocksForClientService());
          setPreviewFields(fm.getFieldsForSigningService());
        }
      })
      .then(() => setLoading(false))
      .catch((e) => {
        alert(e);
        setLoading(false);
      });

    setLoading(true);
    return () => controller.abort();
  }, [formName, formVersion]);

  // Clear fields on refresh?
  useEffect(() => {
    setFields([]);
    setParams({});
    setFormMetadata(new FormMetadata(initialFormMetadata));
  }, []);

  // Updates the field previews
  // (we have to touch the DOM directly for this to go under the hoods of the lib we're using)
  useEffect(() => {
    // Refresh previews
    refreshPreviews();

    return () => setPreviews({});
  }, [selectedPreviewId, keyedFields]);

  // The form context
  const formContext: IFormRendererContext = {
    formName,
    formVersion,
    formMetadata,
    fields,
    blocks,
    params,
    keyedFields,
    previews,
    loading,
    selectedPreviewId: selectedPreviewId || null,
    setSelectedPreviewId: (id: string | null) => setSelectedPreviewId(id ?? ""),
    document: { name: documentName, url: documentUrl },
    updateFormName: (newFormName: string) => setFormName(newFormName),
    refreshPreviews: refreshPreviews,
  };

  return (
    <FormRendererContext.Provider value={formContext}>
      {children}
    </FormRendererContext.Provider>
  );
};

/**
 * A preview of what the field will look like on the document.
 *
 * @component
 */
const FieldPreview = ({
  field,
  x,
  y,
  w,
  h,
  selected,
  onClick,
}: {
  field: string;
  x: number;
  y: number;
  w: number;
  h: number;
  selected: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 border-0!",
        selected ? "bg-supportive/50!" : "bg-warning/50!",
      )}
      onClick={() => onClick()}
      onMouseDown={onClick}
      style={{
        userSelect: "auto",
        display: "inline-block",
        width: `round(var(--scale-factor) * ${w}px, 1px)`,
        height: `round(var(--scale-factor) * ${h}px, 1px)`,
        fontSize: "10px",
        transform: `translate(round(var(--scale-factor) * ${x}px, 1px), round(var(--scale-factor) * ${y}px, 1px))`,
        boxSizing: "border-box",
        cursor: "pointer",
        flexShrink: "0",
      }}
    >
      {field}
    </div>
  );
};
