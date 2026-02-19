/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-11-09 03:19:04
 * @ Modified time: 2026-01-06 19:31:46
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
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { FormService } from "@/lib/api/services";
import { PublicUser } from "@/lib/db/db.types";
import { useQuery } from "@tanstack/react-query";
import {
  FORM_RENDERER_STALE_TIME,
  FORM_RENDERER_GC_TIME,
} from "@/lib/consts/cache";

// ? Current schema version, update if needed; tells us if out of date
export const SCHEMA_VERSION = 1;

// Context interface
export interface IFormRendererContext<T extends any[]> {
  formName: string;
  formLabel: string;
  formVersion: number;
  formMetadata: FormMetadata<T>;
  document: IDocument;
  fields: (ClientField<T> | ClientPhantomField<T>)[];
  blocks: ClientBlock<T>[];
  params: IFormParameters;
  keyedFields: (ServerField & { _id: string })[];
  previews: Record<number, React.ReactNode[]>;
  loading: boolean;
  selectedPreviewId: string | null;
  setSelectedPreviewId: (id: string | null) => void;

  // Setters
  updateFormName: (newFormName: string) => void;
  refreshPreviews: () => void;
  updateFieldsWithParams: (newParams: Record<string, any>) => void;
}

interface IDocument {
  name: string;
  url: string;
}

// Context defs
const FormRendererContext = createContext<IFormRendererContext<[PublicUser]>>(
  {} as IFormRendererContext<[PublicUser]>,
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
  // Default form metadata
  const initialFormMetadata: IFormMetadata = {
    name: "",
    label: "",
    schema_version: SCHEMA_VERSION,
    schema: { blocks: [] },
    subscribers: [],
    signing_parties: [],
  };

  const [formMetadata, setFormMetadata] = useState<FormMetadata<[PublicUser]>>(
    new FormMetadata(initialFormMetadata),
  );
  const [documentName, setDocumentName] = useState<string>("");
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [formName, setFormName] = useState<string>("");
  const [formLabel, setFormLabel] = useState<string>("");
  const [formVersion, setFormVersion] = useState<number>(0);
  const [previewFields, setPreviewFields] = useState<ServerField[]>([]);
  const [blocks, setBlocks] = useState<ClientBlock<[PublicUser]>[]>([]);
  const [fields, setFields] = useState<ClientField<[PublicUser]>[]>([]);
  const [params, setParams] = useState<IFormParameters>({});
  const [previews, setPreviews] = useState<Record<number, React.ReactNode[]>>(
    {},
  );
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>("");

  // Cache forms
  const { data: form, isLoading } = useQuery({
    queryKey: useMemo(() => ["my-form-template", formName], [formName]),
    queryFn: useCallback(() => FormService.getForm(formName), [formName]),
    enabled: !!formName,
    staleTime: FORM_RENDERER_STALE_TIME,
    gcTime: FORM_RENDERER_GC_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: "stale",
    refetchOnReconnect: true,
  });

  // Used in the ui for selecting / distinguishing fields
  const keyedFields = useMemo(
    () =>
      previewFields.map((field) => ({
        _id: Math.random().toString(),
        ...field,
      })),
    [previewFields],
  );

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
    if (!form || !form.formMetadata) return;

    const fm = new FormMetadata(form.formMetadata);
    const newFormName = form.formMetadata.name;
    const newFormLabel = form.formMetadata.label;
    const newFormVersion = form.formDocument.version;

    // Only update form if it's new
    setFormMetadata(fm);
    setFormName(newFormName);
    setFormLabel(newFormLabel);
    setFormVersion(newFormVersion);
    setDocumentName(form.formDocument.name);
    setDocumentUrl(form.documentUrl);
    const loadedFields = fm.getFieldsForClientService("initiator");

    setFields(loadedFields);
    setBlocks(fm.getBlocksForClientService("initiator"));
    setPreviewFields(fm.getFieldsForSigningService());
  }, [form]);

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
  const formContext: IFormRendererContext<[PublicUser]> = {
    formName,
    formLabel,
    formVersion,
    formMetadata,
    fields,
    blocks,
    params,
    keyedFields,
    previews,
    loading: isLoading,
    selectedPreviewId: selectedPreviewId || null,
    setSelectedPreviewId: (id: string | null) => setSelectedPreviewId(id ?? ""),
    document: { name: documentName, url: documentUrl },
    updateFormName: (newFormName: string) => setFormName(newFormName),
    refreshPreviews: refreshPreviews,
    updateFieldsWithParams: (newParams: Record<string, any>) => {
      // Merge new params with existing ones (don't replace)
      const mergedParams = { ...params, ...newParams };
      setFields(
        formMetadata.getFieldsForClientService("initiator", mergedParams),
      );
      setParams(mergedParams);
    },
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
export const FieldPreview = ({
  field,
  value,
  x,
  y,
  w,
  h,
  selected,
  onClick,
}: {
  field: string;
  value?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  selected: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 border-0!",
        selected ? "bg-supportive/50!" : "bg-warning/50!",
      )}
      onClick={() => onClick?.()}
      onMouseDown={() => onClick?.()}
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
      {value ?? field}
    </div>
  );
};
