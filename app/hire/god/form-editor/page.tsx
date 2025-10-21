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

// shadcn/ui (adjust for your project)
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

type FieldBoxTrue = {
  id: string;
  field: string;
  type: FieldType;
  assignee: FieldAssignee;
  page: number; // 1-based
  x: number; // TRUE coords (server-space)
  y: number; // TRUE coords
  w: number; // TRUE coords
  h: number; // TRUE coords
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

type ExportMeta = {
  exportMode: "true"; // we now export in TRUE coords directly
  imagePageSizesPx: Record<number, { width: number; height: number }>;
  standardTransform: {
    scaleX: number;
    scaleY: number;
    offsetX: number;
    offsetY: number;
  };
};

type ExportedPayload = { schema: SchemaItem[]; meta: ExportMeta };

// --- Standard transform shared with your PDF generator ---
const STANDARD = { scaleX: 0.186, scaleY: 0.218, offsetX: 0, offsetY: 0 };

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

/**
 * Transform relations
 *  - TRUE (T) ↔ PIXELS (P)
 *  - P → T:  xT = xP*sx + ox; yT = yP*sy + oy
 *  - T → P:  xP = (xT - ox)/sx; yP = (yT - oy)/sy
 */
const PtoT = (
  p: { x: number; y: number; w: number; h: number },
  sx: number,
  sy: number,
  ox: number,
  oy: number,
) => ({
  x: p.x * sx + ox,
  y: p.y * sy + oy,
  w: p.w * sx,
  h: p.h * sy,
});
const TtoP = (
  t: { x: number; y: number; w: number; h: number },
  sx: number,
  sy: number,
  ox: number,
  oy: number,
) => ({
  x: (t.x - ox) / sx,
  y: (t.y - oy) / sy,
  w: t.w / sx,
  h: t.h / sy,
});

export default function FieldMapperPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Pages as images
  const [images, setImages] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [pageSizeByPage, setPageSizeByPage] = useState<
    Record<number, { width: number; height: number }>
  >({});

  // BOXES ARE STORED IN TRUE COORDS NOW
  const [boxes, setBoxes] = useState<FieldBoxTrue[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  const [defaultType, setDefaultType] = useState<FieldType>("text");
  const [defaultAssignee, setDefaultAssignee] =
    useState<FieldAssignee>("student");
  const [eraseMode, setEraseMode] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>("");

  // Standard transform (persisted)
  const [scaleX, setScaleX] = useState<number>(() =>
    Number(localStorage.getItem("fm_true_sx") ?? STANDARD.scaleX),
  );
  const [scaleY, setScaleY] = useState<number>(() =>
    Number(localStorage.getItem("fm_true_sy") ?? STANDARD.scaleY),
  );
  const [offsetX, setOffsetX] = useState<number>(() =>
    Number(localStorage.getItem("fm_true_ox") ?? STANDARD.offsetX),
  );
  const [offsetY, setOffsetY] = useState<number>(() =>
    Number(localStorage.getItem("fm_true_oy") ?? STANDARD.offsetY),
  );
  useEffect(() => {
    localStorage.setItem("fm_true_sx", String(scaleX));
    localStorage.setItem("fm_true_sy", String(scaleY));
    localStorage.setItem("fm_true_ox", String(offsetX));
    localStorage.setItem("fm_true_oy", String(offsetY));
  }, [scaleX, scaleY, offsetX, offsetY]);

  // Import toggle: if source is pixels, convert P→T on import
  const [importIsPixels, setImportIsPixels] = useState<boolean>(false);

  const numPages = images.length || 1;
  const currentPageSize = pageSizeByPage[page];

  // History
  const [history, setHistory] = useState<FieldBoxTrue[][]>([]);
  const [future, setFuture] = useState<FieldBoxTrue[][]>([]);
  const pushHistory = useCallback(
    (next: FieldBoxTrue[] | ((prev: FieldBoxTrue[]) => FieldBoxTrue[])) => {
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
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [boxes, ...f]);
      setBoxes(prev);
      return h.slice(0, -1);
    });
  }, [boxes]);
  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setHistory((h) => [...h, boxes]);
      setBoxes(next);
      return f.slice(1);
    });
  }, [boxes]);

  // Derived
  const currentBoxesT = useMemo(
    () => boxes.filter((b) => b.page === page),
    [boxes, page],
  );
  const selected = useMemo(
    () => boxes.find((b) => b.id === selectedId) || null,
    [boxes, selectedId],
  );

  // Upload images
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
      setPageSizeByPage({});
      toast({
        title: "Pages loaded",
        description: `${urls.length} page image(s).`,
      });
    },
    [toast],
  );

  // Add box (drop pos is in PIXELS; we convert to TRUE before storing)
  const addBox = useCallback(
    (
      fieldKey: string,
      dropPx?: { x: number; y: number },
      overrides?: Partial<FieldBoxTrue>,
    ) => {
      const id = uid();
      const baseP = {
        x: Math.max(0, dropPx?.x ?? 50),
        y: Math.max(0, dropPx?.y ?? 50),
        w: Math.max(
          8,
          (overrides?.w ?? (overrides?.type ?? "text") === "signature")
            ? 235
            : 235,
        ),
        h: Math.max(
          8,
          (overrides?.h ?? (overrides?.type ?? "text") === "signature")
            ? 30
            : 12,
        ),
      };
      const baseT = PtoT(baseP, scaleX, scaleY, offsetX, offsetY);
      const newBox: FieldBoxTrue = {
        id,
        field: fieldKey,
        type: (overrides?.type as FieldType) ?? defaultType,
        assignee: (overrides?.assignee as FieldAssignee) ?? defaultAssignee,
        page: overrides?.page ?? page,
        x: baseT.x,
        y: baseT.y,
        w: baseT.w,
        h: baseT.h,
        ...(overrides?.value ? { value: overrides.value } : {}),
      };
      pushHistory((prev) => [...prev, newBox]);
      setSelectedId(id);
    },
    [
      defaultAssignee,
      defaultType,
      offsetX,
      offsetY,
      page,
      pushHistory,
      scaleX,
      scaleY,
    ],
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
    // offset in true by a small delta. Use + (12px → true): ΔT = PtoT({x:12,y:12,w:0,h:0}) - PtoT({0,0,0,0})
    const deltaT = PtoT({ x: 12, y: 12, w: 0, h: 0 }, scaleX, scaleY, 0, 0);
    const clone: FieldBoxTrue = {
      ...selected,
      id: uid(),
      x: selected.x + deltaT.x,
      y: selected.y + deltaT.y,
    };
    pushHistory((prev) => [...prev, clone]);
    setSelectedId(clone.id);
  }, [selected, pushHistory, scaleX, scaleY]);

  const updateSelected = useCallback(
    (patch: Partial<FieldBoxTrue>) => {
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
    if (!boxes.length) return;
    pushHistory([]);
    setSelectedId(null);
  }, [boxes.length, pushHistory]);

  // Export TRUE coords directly
  const buildSchemaForExport = useCallback((): ExportedPayload => {
    const schema: SchemaItem[] = boxes.map((b) => ({
      h: Math.round(b.h),
      w: Math.round(b.w),
      x: Math.round(b.x),
      y: Math.round(b.y),
      page: b.page,
      type: b.type,
      field: b.field,
      ...(b.value ? { value: b.value } : {}),
    }));
    const meta: ExportMeta = {
      exportMode: "true",
      imagePageSizesPx: pageSizeByPage,
      standardTransform: { scaleX, scaleY, offsetX, offsetY },
    };
    return { schema, meta };
  }, [boxes, offsetX, offsetY, pageSizeByPage, scaleX, scaleY]);

  const exportSchema = useCallback(() => {
    const payload = buildSchemaForExport();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "form-schema.json");
    toast({ title: "Exported", description: "form-schema.json downloaded." });
  }, [buildSchemaForExport, toast]);

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

  const copyBothToClipboard = useCallback(async () => {
    const fieldsMap = boxes.reduce<Record<string, { for: FieldAssignee }>>(
      (acc, b) => {
        acc[b.field] = { for: b.assignee };
        return acc;
      },
      {},
    );
    const schemaPayload = buildSchemaForExport();
    await navigator.clipboard.writeText(
      JSON.stringify({ fields: fieldsMap, ...schemaPayload }, null, 2),
    );
    toast({
      title: "Copied",
      description: "Fields + schema (true coords) copied to clipboard.",
    });
  }, [boxes, buildSchemaForExport, toast]);

  // Shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeSelected();
      } else if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, removeSelected, selectedId, undo]);

  // Drag from palette → drop on page (event gives PIXELS; convert to TRUE)
  const onPaletteDragStart = (
    e: React.DragEvent,
    item: FieldRepositoryItem,
  ) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ key: item.key }));
    e.dataTransfer.effectAllowed = "copy";
  };
  const getDropPosPx = (evt: React.DragEvent) => {
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
      const posPx = getDropPosPx(e);
      addBox(data.key, posPx);
    } catch {}
  };

  // Import (default assumes TRUE coords; if importIsPixels, convert P→T)
  const importFromText = useCallback(() => {
    if (!importText.trim()) {
      toast({ title: "Nothing to import", description: "Paste JSON first." });
      return;
    }
    try {
      const data = JSON.parse(importText) as any;
      let schema: SchemaItem[] | null = null;
      let fieldsMap: FieldsMap | null = null;

      if (Array.isArray(data)) schema = data as SchemaItem[];
      else if (data && typeof data === "object") {
        fieldsMap = data.fields ?? null;
        schema = data.schema ?? null;
      }

      if (!schema?.length) {
        toast({
          title: "No schema found",
          description: "Need array with x,y,w,h,page,type,field.",
          variant: "destructive",
        });
        return;
      }

      const imported: FieldBoxTrue[] = schema.map((sRaw) => {
        const t = importIsPixels
          ? PtoT(
              {
                x: sRaw.x ?? 50,
                y: sRaw.y ?? 50,
                w: sRaw.w ?? 235,
                h: sRaw.h ?? (sRaw.type === "signature" ? 30 : 12),
              },
              scaleX,
              scaleY,
              offsetX,
              offsetY,
            )
          : {
              x: sRaw.x ?? 50,
              y: sRaw.y ?? 50,
              w: sRaw.w ?? 235,
              h: sRaw.h ?? (sRaw.type === "signature" ? 30 : 12),
            };

        return {
          id: uid(),
          field: sRaw.field,
          type: sRaw.type,
          assignee: fieldsMap?.[sRaw.field]?.for ?? defaultAssignee,
          page: sRaw.page ?? page,
          x: t.x,
          y: t.y,
          w: t.w,
          h: t.h,
          ...(sRaw.value ? { value: sRaw.value } : {}),
        };
      });

      pushHistory((prev) => [...prev, ...imported]);
      setSelectedId(imported[0]?.id ?? null);
      toast({
        title: "Imported",
        description: `Added ${imported.length} field${imported.length === 1 ? "" : "s"}.`,
      });
    } catch (err: any) {
      toast({
        title: "Failed to import",
        description: err?.message ?? "Invalid JSON",
        variant: "destructive",
      });
    }
  }, [
    defaultAssignee,
    importIsPixels,
    importText,
    offsetX,
    offsetY,
    page,
    pushHistory,
    scaleX,
    scaleY,
    toast,
  ]);

  const filteredRepo = useMemo(() => {
    if (!filter) return DEFAULT_REPO;
    const f = filter.toLowerCase();
    return DEFAULT_REPO.filter(
      (r) =>
        r.key.toLowerCase().includes(f) || r.label?.toLowerCase().includes(f),
    );
  }, [filter]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] grid grid-cols-12 gap-3 p-3">
      {/* LEFT */}
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
                  <FileUp className="w-4 h-4" /> Upload
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

        {/* Selection (TRUE coords) */}
        <Card className="rounded-xl">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Selection (true coords)</CardTitle>
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

        {/* Transform (standard) */}
        <Card className="rounded-xl">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Standard Transform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-[12px] text-muted-foreground -mt-1">
              TRUE ↔ PIXELS · default: sx=0.186 · sy=0.218
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] opacity-75">Scale X</Label>
                <Input
                  className="h-8"
                  type="number"
                  step="0.001"
                  value={scaleX}
                  onChange={(e) => setScaleX(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-[11px] opacity-75">Scale Y</Label>
                <Input
                  className="h-8"
                  type="number"
                  step="0.001"
                  value={scaleY}
                  onChange={(e) => setScaleY(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-[11px] opacity-75">Offset X</Label>
                <Input
                  className="h-8"
                  type="number"
                  step="1"
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-[11px] opacity-75">Offset Y</Label>
                <Input
                  className="h-8"
                  type="number"
                  step="1"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScaleX(STANDARD.scaleX);
                  setScaleY(STANDARD.scaleY);
                  setOffsetX(STANDARD.offsetX);
                  setOffsetY(STANDARD.offsetY);
                }}
              >
                Reset to standard
              </Button>
            </div>
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
                Paste schema (TRUE by default)
              </Label>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`TRUE example:\n[\n  { "x": 16.9, "y": 34.5, "w": 43.7, "h": 2.6, "page": 1, "type": "text", "field": "agreement-date" }\n]\n\nPIXELS? Toggle below to convert on import.`}
                className="min-h-[120px] text-xs"
              />
              <div className="flex items-center gap-2">
                <input
                  id="importpx"
                  type="checkbox"
                  checked={importIsPixels}
                  onChange={(e) => setImportIsPixels(e.target.checked)}
                />
                <Label htmlFor="importpx" className="text-[12px]">
                  Incoming schema is in PIXELS (convert to TRUE)
                </Label>
              </div>
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

      {/* RIGHT: canvas */}
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
                  disabled={!history.length}
                  title="Undo (Ctrl/Cmd+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={redo}
                  disabled={!future.length}
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
                  {/* Page */}
                  <img
                    src={images[page - 1]}
                    onLoad={(e) => {
                      const el = e.currentTarget;
                      setPageSizeByPage((prev) => ({
                        ...prev,
                        [page]: {
                          width: el.naturalWidth,
                          height: el.naturalHeight,
                        },
                      }));
                    }}
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                    className="block select-none rounded"
                    alt={`Page ${page}`}
                  />

                  {/* Overlay (positions in PIXELS, converted from TRUE) */}
                  <div
                    ref={overlayRef}
                    className="absolute top-0 left-0 z-10 select-none"
                    style={{
                      width: currentPageSize?.width ?? 0,
                      height: currentPageSize?.height ?? 0,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                    onDragOver={onOverlayDragOver}
                    onDrop={onOverlayDrop}
                  >
                    {currentBoxesT.map((b) => {
                      // Convert TRUE → PIXELS for Rnd presentation
                      const p = TtoP(
                        { x: b.x, y: b.y, w: b.w, h: b.h },
                        scaleX,
                        scaleY,
                        offsetX,
                        offsetY,
                      );
                      return (
                        <Rnd
                          key={b.id}
                          size={{ width: p.w, height: p.h }}
                          position={{ x: p.x, y: p.y }}
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
                          onDragStop={(_, d) => {
                            // d.x/d.y are PIXELS → convert to TRUE before saving
                            const t = PtoT(
                              { x: d.x, y: d.y, w: p.w, h: p.h },
                              scaleX,
                              scaleY,
                              offsetX,
                              offsetY,
                            );
                            pushHistory((prev) =>
                              prev.map((bx) =>
                                bx.id === b.id ? { ...bx, x: t.x, y: t.y } : bx,
                              ),
                            );
                          }}
                          onResizeStop={(_, __, ref, ___, pos) => {
                            const newPx = {
                              x: pos.x,
                              y: pos.y,
                              w: parseInt(ref.style.width),
                              h: parseInt(ref.style.height),
                            };
                            const t = PtoT(
                              newPx,
                              scaleX,
                              scaleY,
                              offsetX,
                              offsetY,
                            );
                            pushHistory((prev) =>
                              prev.map((bx) =>
                                bx.id === b.id
                                  ? { ...bx, x: t.x, y: t.y, w: t.w, h: t.h }
                                  : bx,
                              ),
                            );
                          }}
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
                      );
                    })}
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
