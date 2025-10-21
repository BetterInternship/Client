"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Rnd } from "react-rnd";
import { saveAs } from "file-saver";
import {
  Download,
  Plus,
  Trash2,
  Copy,
  FileUp,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  PencilRuler,
  Maximize2,
  Undo2,
  Redo2,
  Eraser,
  X,
  CopyPlus,
  ClipboardPaste,
} from "lucide-react";

// shadcn/ui (using your landingHire variants where you did, and regular ui elsewhere)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/landingHire/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/landingHire/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

// ---------- Types ----------
type FieldAssignee =
  | "student"
  | "entity"
  | "system"
  | "university"
  | "student-guardian";
type FieldType = "text" | "signature" | "date" | "time" | "number";

type FieldBox = {
  id: string;
  field: string;
  type: FieldType;
  assignee: FieldAssignee;
  page: number; // 1-based
  x: number;
  y: number;
  w: number;
  h: number;
  value?: string;
};

type FieldRepositoryItem = {
  key: string;
  label?: string;
  defaultType?: FieldType;
  defaultAssignee?: FieldAssignee;
};

type SchemaItem = {
  h: number;
  w: number;
  x: number;
  y: number;
  page: number;
  type: FieldType;
  field: string;
  value?: string;
};

type FieldsMap = Record<string, { for: FieldAssignee }>;

// ---------- Utils ----------
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_REPO: FieldRepositoryItem[] = [
  { key: "entity-id", defaultAssignee: "student", defaultType: "text" },
  { key: "entity-type", defaultAssignee: "entity", defaultType: "text" },
  { key: "agreement-date", defaultAssignee: "system", defaultType: "date" },
  { key: "entity-address", defaultAssignee: "system", defaultType: "text" },
  { key: "student-degree", defaultAssignee: "system", defaultType: "text" },
  { key: "student-address", defaultAssignee: "student", defaultType: "text" },
  { key: "student-college", defaultAssignee: "system", defaultType: "text" },
  {
    key: "internship-hours",
    defaultAssignee: "student",
    defaultType: "number",
  },
  { key: "internship-venue", defaultAssignee: "student", defaultType: "text" },
  { key: "entity-legal-name", defaultAssignee: "system", defaultType: "text" },
  { key: "student-id-number", defaultAssignee: "student", defaultType: "text" },
  { key: "student-last-name", defaultAssignee: "system", defaultType: "text" },
  { key: "student-first-name", defaultAssignee: "system", defaultType: "text" },
  {
    key: "internship-end-date",
    defaultAssignee: "student",
    defaultType: "date",
  },
  {
    key: "internship-end-time",
    defaultAssignee: "student",
    defaultType: "time",
  },
  {
    key: "student-middle-name",
    defaultAssignee: "system",
    defaultType: "text",
  },
  {
    key: "internship-start-date",
    defaultAssignee: "student",
    defaultType: "date",
  },
  {
    key: "internship-start-time",
    defaultAssignee: "student",
    defaultType: "time",
  },
  {
    key: "student-guardian-name",
    defaultAssignee: "student",
    defaultType: "text",
  },
  {
    key: "student-guardian-email",
    defaultAssignee: "student",
    defaultType: "text",
  },
  {
    key: "internship-venue-address",
    defaultAssignee: "student",
    defaultType: "text",
  },
  {
    key: "entity-hte-supervisor-name",
    defaultAssignee: "entity",
    defaultType: "text",
  },
  {
    key: "entity-representative-name",
    defaultAssignee: "entity",
    defaultType: "text",
  },
  {
    key: "student-guardian-signature",
    defaultAssignee: "student-guardian",
    defaultType: "signature",
  },
  {
    key: "entity-representative-position",
    defaultAssignee: "entity",
    defaultType: "text",
  },
  {
    key: "entity-hte-supervisor-signature",
    defaultAssignee: "entity",
    defaultType: "signature",
  },
  {
    key: "entity-representative-signature",
    defaultAssignee: "entity",
    defaultType: "signature",
  },
  {
    key: "university-internship-coordinator-name",
    defaultAssignee: "student",
    defaultType: "text",
  },
  {
    key: "university-internship-coordinator-signature",
    defaultAssignee: "university",
    defaultType: "signature",
  },
];

export default function FieldMapperPage() {
  const containerRef = useRef<HTMLDivElement | null>(null); // scroll container
  const overlayRef = useRef<HTMLDivElement | null>(null); // scaled overlay
  const { toast } = useToast();

  // MULTI-PAGE via multiple images
  const [images, setImages] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1); // 1-based
  const [scale, setScale] = useState<number>(1);
  const [pageSize, setPageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [boxes, setBoxes] = useState<FieldBox[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  // Defaults for new boxes
  const [defaultType, setDefaultType] = useState<FieldType>("text");
  const [defaultAssignee, setDefaultAssignee] =
    useState<FieldAssignee>("student");

  // Tools
  const [eraseMode, setEraseMode] = useState<boolean>(false);

  // Paste importer
  const [importText, setImportText] = useState<string>("");

  const numPages = images.length || 1;

  // ---- History (Undo/Redo) ----
  const [history, setHistory] = useState<FieldBox[][]>([]);
  const [future, setFuture] = useState<FieldBox[][]>([]);

  const pushHistory = useCallback(
    (next: FieldBox[] | ((prev: FieldBox[]) => FieldBox[])) => {
      setBoxes((prev) => {
        const computed = typeof next === "function" ? next(prev) : next;
        setHistory((h) => [...h, prev]);
        setFuture([]);
        return computed;
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [boxes, ...f]);
      setBoxes(prev);
      return h.slice(0, -1);
    });
  }, [boxes]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, boxes]);
      setBoxes(next);
      return f.slice(1);
    });
  }, [boxes]);

  // derived
  const currentBoxes = useMemo(
    () => boxes.filter((b) => b.page === page),
    [boxes, page],
  );
  const selected = useMemo(
    () => boxes.find((b) => b.id === selectedId) || null,
    [boxes, selectedId],
  );

  // Upload multiple PNG/JPG pages
  const onUploadImages = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      const urls = await Promise.all(
        files.map(
          (f) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.readAsDataURL(f);
            }),
        ),
      );
      setImages(urls);
      setPage(1);
      setPageSize(null);
      toast({
        title: "Pages loaded",
        description: `${urls.length} page image(s).`,
      });
    },
    [toast],
  );

  // Add a box (at optional coords)
  const addBox = useCallback(
    (
      fieldKey: string,
      at?: { x: number; y: number },
      overrides?: Partial<FieldBox>,
    ) => {
      const id = uid();
      const newBox: FieldBox = {
        id,
        field: fieldKey,
        type: (overrides?.type as FieldType) ?? defaultType,
        assignee: (overrides?.assignee as FieldAssignee) ?? defaultAssignee,
        page: overrides?.page ?? page,
        x: Math.max(0, at?.x ?? overrides?.x ?? 50),
        y: Math.max(0, at?.y ?? overrides?.y ?? 50),
        w: Math.max(
          8,
          overrides?.w ?? (defaultType === "signature" ? 235 : 235),
        ),
        h: Math.max(8, overrides?.h ?? (defaultType === "signature" ? 30 : 12)),
        ...(overrides?.value ? { value: overrides.value } : {}),
      };
      pushHistory((prev) => [...prev, newBox]);
      setSelectedId(id);
    },
    [defaultAssignee, defaultType, page, pushHistory],
  );

  const removeSelected = useCallback(() => {
    if (!selectedId) return;
    pushHistory((prev) => prev.filter((b) => b.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, pushHistory]);

  const removeBoxById = useCallback(
    (id: string) => {
      pushHistory((prev) => prev.filter((b) => b.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [pushHistory, selectedId],
  );

  const duplicateSelected = useCallback(() => {
    if (!selected) return;
    const clone: FieldBox = {
      ...selected,
      id: uid(),
      x: selected.x + 12,
      y: selected.y + 12,
    };
    pushHistory((prev) => [...prev, clone]);
    setSelectedId(clone.id);
  }, [selected, pushHistory]);

  const updateSelected = useCallback(
    (patch: Partial<FieldBox>) => {
      if (!selectedId) return;
      pushHistory((prev) =>
        prev.map((b) => (b.id === selectedId ? { ...b, ...patch } : b)),
      );
    },
    [selectedId, pushHistory],
  );

  const clearCurrentPage = useCallback(() => {
    pushHistory((prev) => prev.filter((b) => b.page !== page));
    setSelectedId(null);
  }, [page, pushHistory]);

  const clearAll = useCallback(() => {
    if (boxes.length === 0) return;
    pushHistory([]);
    setSelectedId(null);
  }, [boxes.length, pushHistory]);

  // Exporters
  const exportFieldsMap = useCallback(() => {
    const fieldsMap = boxes.reduce<Record<string, { for: FieldAssignee }>>(
      (acc, b) => {
        acc[b.field] = { for: b.assignee };
        return acc;
      },
      {},
    );
    const blob = new Blob([JSON.stringify(fieldsMap, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "fields-map.json");
    toast({ title: "Exported", description: "fields-map.json downloaded." });
  }, [boxes, toast]);

  const exportSchema = useCallback(() => {
    const schema = boxes.map((b) => ({
      h: Math.round(b.h),
      w: Math.round(b.w),
      x: Math.round(b.x),
      y: Math.round(b.y),
      page: b.page,
      type: b.type,
      field: b.field,
      ...(b.value ? { value: b.value } : {}),
    }));
    const blob = new Blob([JSON.stringify(schema, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "form-schema.json");
    toast({ title: "Exported", description: "form-schema.json downloaded." });
  }, [boxes, toast]);

  const copyBothToClipboard = useCallback(async () => {
    const fieldsMap = boxes.reduce<Record<string, { for: FieldAssignee }>>(
      (acc, b) => {
        acc[b.field] = { for: b.assignee };
        return acc;
      },
      {},
    );
    const schema = boxes.map((b) => ({
      h: Math.round(b.h),
      w: Math.round(b.w),
      x: Math.round(b.x),
      y: Math.round(b.y),
      page: b.page,
      type: b.type,
      field: b.field,
      ...(b.value ? { value: b.value } : {}),
    }));
    await navigator.clipboard.writeText(
      JSON.stringify({ fields: fieldsMap, schema }, null, 2),
    );
    toast({
      title: "Copied",
      description: "Fields + schema copied to clipboard.",
    });
  }, [boxes, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          removeSelected();
        }
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, removeSelected, selectedId, undo]);

  // ---- Drag from palette → drop on page ----
  const onPaletteDragStart = (
    e: React.DragEvent,
    item: FieldRepositoryItem,
  ) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ key: item.key }));
    e.dataTransfer.effectAllowed = "copy";
  };

  const getDropPos = (evt: React.DragEvent) => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return { x: 50, y: 50 };
    const rect = overlay.getBoundingClientRect();
    const x = (evt.clientX - rect.left + container.scrollLeft) / scale;
    const y = (evt.clientY - rect.top + container.scrollTop) / scale;
    return { x: Math.max(0, Math.round(x)), y: Math.max(0, Math.round(y)) };
  };

  const onOverlayDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const onOverlayDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (!data?.key) return;
      const pos = getDropPos(e);
      addBox(data.key, pos);
    } catch {}
  };

  const filteredRepo = useMemo(() => {
    if (!filter) return DEFAULT_REPO;
    const f = filter.toLowerCase();
    return DEFAULT_REPO.filter(
      (r) =>
        r.key.toLowerCase().includes(f) || r.label?.toLowerCase().includes(f),
    );
  }, [filter]);

  // ---- Import pasted schema/fields ----
  const importFromText = useCallback(() => {
    if (!importText.trim()) {
      toast({ title: "Nothing to import", description: "Paste JSON first." });
      return;
    }
    try {
      const data = JSON.parse(importText) as unknown;

      let schema: SchemaItem[] | null = null;
      let fieldsMap: FieldsMap | null = null;

      // Support either:
      // 1) { fields: {...}, schema: [...] }
      // 2) [ ...schemaItems ]
      if (Array.isArray(data)) {
        schema = data as SchemaItem[];
      } else if (data && typeof data === "object") {
        const obj = data as { fields?: FieldsMap; schema?: SchemaItem[] };
        if (obj.fields) fieldsMap = obj.fields;
        if (obj.schema) schema = obj.schema!;
      }

      if (!schema || schema.length === 0) {
        toast({
          title: "No schema found",
          description:
            "Expecting an array of items with x,y,w,h,page,type,field.",
          variant: "destructive",
        });
        return;
      }

      // Map schema items into boxes; set assignee from fieldsMap if available, else fall back to defaults
      const imported: FieldBox[] = schema.map((s) => {
        const id = uid();
        const assignee = fieldsMap?.[s.field]?.for ?? defaultAssignee;
        return {
          id,
          field: s.field,
          type: s.type,
          assignee,
          page: s.page ?? page,
          x: Math.max(0, s.x ?? 50),
          y: Math.max(0, s.y ?? 50),
          w: Math.max(8, s.w ?? 235),
          h: Math.max(8, s.h ?? (s.type === "signature" ? 30 : 12)),
          ...(s.value ? { value: s.value } : {}),
        };
      });

      pushHistory((prev) => [...prev, ...imported]);
      setSelectedId(imported[0]?.id ?? null);

      toast({
        title: "Imported",
        description: `Added ${imported.length} field${imported.length === 1 ? "" : "s"} from schema.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to import",
        description: err?.message ?? "Invalid JSON",
        variant: "destructive",
      });
    }
  }, [defaultAssignee, importText, page, pushHistory, toast]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] grid grid-cols-12 gap-3 p-3">
      {/* LEFT: compact controls */}
      <div className="col-span-12 md:col-span-4 xl:col-span-3 flex flex-col gap-3">
        <Card className="rounded-xl">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <PencilRuler className="w-4 h-4" />
              Palette
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pageImages" className="text-xs opacity-75">
                Pages (PNG/JPG)
              </Label>
              <Button variant="outline" size="sm" asChild>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <FileUp className="w-4 h-4" />
                  Upload
                  <input
                    id="pageImages"
                    type="file"
                    accept="image/png,image/jpeg"
                    multiple
                    className="hidden"
                    onChange={onUploadImages}
                  />
                </label>
              </Button>
            </div>

            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search fields…"
              className="h-8"
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] opacity-75">Type</Label>
                <Select
                  value={defaultType}
                  onValueChange={(v) => setDefaultType(v as FieldType)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">text</SelectItem>
                    <SelectItem value="signature">signature</SelectItem>
                    <SelectItem value="date">date</SelectItem>
                    <SelectItem value="time">time</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] opacity-75">For</Label>
                <Select
                  value={defaultAssignee}
                  onValueChange={(v) => setDefaultAssignee(v as FieldAssignee)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">student</SelectItem>
                    <SelectItem value="entity">entity</SelectItem>
                    <SelectItem value="system">system</SelectItem>
                    <SelectItem value="university">university</SelectItem>
                    <SelectItem value="student-guardian">
                      student-guardian
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />
            <ScrollArea className="h-56 rounded border">
              <div className="p-1 grid grid-cols-1 gap-1">
                {filteredRepo.map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    className="h-8 justify-between px-2"
                    onClick={() => addBox(item.key)}
                    draggable
                    onDragStart={(e) => onPaletteDragStart(e, item)}
                  >
                    <span className="truncate text-xs">{item.key}</span>
                    <Plus className="w-4 h-4 opacity-60" />
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Selection */}
        <Card className="rounded-xl">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {selected ? (
              <>
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Label className="text-[11px] opacity-75">field</Label>
                  <Input
                    value={selected.field}
                    onChange={(e) => updateSelected({ field: e.target.value })}
                    className="h-8"
                  />

                  <Label className="text-[11px] opacity-75">type</Label>
                  <Select
                    value={selected.type}
                    onValueChange={(v) =>
                      updateSelected({ type: v as FieldType })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">text</SelectItem>
                      <SelectItem value="signature">signature</SelectItem>
                      <SelectItem value="date">date</SelectItem>
                      <SelectItem value="time">time</SelectItem>
                      <SelectItem value="number">number</SelectItem>
                    </SelectContent>
                  </Select>

                  <Label className="text-[11px] opacity-75">for</Label>
                  <Select
                    value={selected.assignee}
                    onValueChange={(v) =>
                      updateSelected({ assignee: v as FieldAssignee })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">student</SelectItem>
                      <SelectItem value="entity">entity</SelectItem>
                      <SelectItem value="system">system</SelectItem>
                      <SelectItem value="university">university</SelectItem>
                      <SelectItem value="student-guardian">
                        student-guardian
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Label className="text-[11px] opacity-75">page</Label>
                  <Input
                    type="number"
                    min={1}
                    max={numPages || 1}
                    value={selected.page}
                    onChange={(e) =>
                      updateSelected({ page: Number(e.target.value) })
                    }
                    className="h-8"
                  />

                  <Label className="text-[11px] opacity-75">value</Label>
                  <Input
                    value={selected.value ?? ""}
                    onChange={(e) => updateSelected({ value: e.target.value })}
                    className="h-8"
                    placeholder={
                      selected.type === "signature"
                        ? "Signature hint"
                        : "(optional)"
                    }
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-[11px] opacity-75">x</Label>
                    <Input
                      type="number"
                      value={Math.round(selected.x)}
                      onChange={(e) =>
                        updateSelected({ x: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] opacity-75">y</Label>
                    <Input
                      type="number"
                      value={Math.round(selected.y)}
                      onChange={(e) =>
                        updateSelected({ y: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] opacity-75">w</Label>
                    <Input
                      type="number"
                      value={Math.round(selected.w)}
                      onChange={(e) =>
                        updateSelected({ w: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] opacity-75">h</Label>
                    <Input
                      type="number"
                      value={Math.round(selected.h)}
                      onChange={(e) =>
                        updateSelected({ h: Number(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    onClick={removeSelected}
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={duplicateSelected}
                    size="sm"
                  >
                    <CopyPlus className="w-4 h-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedId(null)}
                    size="sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Deselect
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">No selection</p>
            )}
          </CardContent>
        </Card>

        {/* Import / Export */}
        <Card className="rounded-xl">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Import / Export</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] opacity-75">
                Paste schema or combined JSON
              </Label>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`Either:\n[\n  { "x": 90, "y": 156, "w": 235, "h": 12, "page": 1, "type": "text", "field": "agreement-date" }\n]\n\nor:\n{\n  "fields": { "agreement-date": { "for": "system" } },\n  "schema": [ ... ]\n}`}
                className="min-h-[120px] text-xs"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={importFromText}>
                  <ClipboardPaste className="w-4 h-4 mr-2" />
                  Import JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportText("")}
                >
                  Clear
                </Button>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={exportFieldsMap}>
                <Download className="w-4 h-4 mr-2" />
                fields-map.json
              </Button>
              <Button variant="outline" size="sm" onClick={exportSchema}>
                <Download className="w-4 h-4 mr-2" />
                form-schema.json
              </Button>
              <Button size="sm" onClick={copyBothToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy both
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: compact canvas */}
      <div className="col-span-12 md:col-span-8 xl:col-span-9">
        <Card className="rounded-xl h-full">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">Page Viewer</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Toggle
                  pressed={eraseMode}
                  onPressedChange={setEraseMode}
                  aria-label="Erase mode"
                  title="Erase mode: click a box to delete"
                >
                  <Eraser className="w-4 h-4 mr-1" />
                  Erase
                </Toggle>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={undo}
                  disabled={history.length === 0}
                  title="Undo (Ctrl/Cmd+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={redo}
                  disabled={future.length === 0}
                  title="Redo (Ctrl/Cmd+Shift+Z)"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-xs w-24 text-center">
                  Page {Math.min(page, numPages)}/{numPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= numPages}
                  onClick={() => setPage((p) => Math.min(numPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)))
                  }
                >
                  –
                </Button>
                <div className="text-xs w-12 text-center">
                  {Math.round(scale * 100)}%
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setScale((s) => Math.min(2, +(s + 0.1).toFixed(2)))
                  }
                >
                  +
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setScale(1)}
                  title="Reset zoom"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearCurrentPage}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear page
                </Button>
                <Button variant="destructive" size="sm" onClick={clearAll}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={containerRef}
              className="relative w-full h-[calc(100vh-12rem)] overflow-auto rounded-lg border bg-muted/40 p-3"
            >
              {images.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <UploadCloud className="w-10 h-10" />
                  <div className="text-sm">
                    Upload page images (PNG/JPG) then drag fields onto the page
                  </div>
                </div>
              ) : (
                <div
                  className="relative inline-block"
                  onMouseDown={(e) => {
                    if (e.currentTarget === e.target) setSelectedId(null);
                  }}
                >
                  {/* Page image */}
                  <img
                    src={images[page - 1]}
                    onLoad={(e) => {
                      const el = e.currentTarget;
                      setPageSize({
                        width: el.naturalWidth,
                        height: el.naturalHeight,
                      });
                    }}
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                    className="block select-none rounded"
                    alt={`Page ${page}`}
                  />

                  {/* Overlay boxes (now sized to natural img size) */}
                  <div
                    ref={overlayRef}
                    className="absolute top-0 left-0 z-10 select-none"
                    style={{
                      width: pageSize?.width ?? 0,
                      height: pageSize?.height ?? 0,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                    onDragOver={onOverlayDragOver}
                    onDrop={onOverlayDrop}
                  >
                    {currentBoxes.map((b) => (
                      <Rnd
                        key={b.id}
                        size={{ width: b.w, height: b.h }}
                        position={{ x: b.x, y: b.y }}
                        bounds="parent"
                        disableDragging={eraseMode}
                        enableResizing={
                          !eraseMode && {
                            top: true,
                            right: true,
                            bottom: true,
                            left: true,
                            topRight: true,
                            bottomRight: true,
                            bottomLeft: true,
                            topLeft: true,
                          }
                        }
                        onDragStop={(_, d) =>
                          pushHistory((prev) =>
                            prev.map((bx) =>
                              bx.id === b.id
                                ? {
                                    ...bx,
                                    x: Math.max(0, d.x),
                                    y: Math.max(0, d.y),
                                  }
                                : bx,
                            ),
                          )
                        }
                        onResizeStop={(_, __, ref, ___, pos) =>
                          pushHistory((prev) =>
                            prev.map((bx) =>
                              bx.id === b.id
                                ? {
                                    ...bx,
                                    w: Math.max(8, parseInt(ref.style.width)),
                                    h: Math.max(8, parseInt(ref.style.height)),
                                    x: Math.max(0, pos.x),
                                    y: Math.max(0, pos.y),
                                  }
                                : bx,
                            ),
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          if (eraseMode) removeBoxById(b.id);
                          else setSelectedId(b.id);
                        }}
                        className={`absolute border rounded bg-background/70 backdrop-blur px-2 py-1 shadow-sm ${
                          selectedId === b.id
                            ? "ring-2 ring-primary"
                            : "ring-1 ring-border"
                        } ${eraseMode ? "cursor-no-drop" : "cursor-move"}`}
                      >
                        <div className="text-[11px] leading-tight">
                          <div
                            className="font-medium truncate max-w-[180px]"
                            title={b.field}
                          >
                            {b.field}
                          </div>
                          <div className="opacity-70">
                            {b.type} · p{b.page}
                          </div>
                        </div>
                      </Rnd>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
