"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/lib/api/services";
import { DynamicForm } from "./DynamicForm";
import { FormDropdown } from "@/components/EditForm";
import { EntityFieldsOnly } from "./EntityFieldsOnly";

type Mode = "select" | "manual" | "invite";

export function FormFlowRouter({ baseForm }: { baseForm: string }) {
  const [selection, setSelection] = useState<string>(""); // company id only
  const [mode, setMode] = useState<Mode>("select");

  const { data, isLoading, error } = useQuery({
    queryKey: ["companies:list"],
    queryFn: UserService.getEntityList,
    staleTime: 60_000,
  });

  const companiesRaw = data?.employers ?? [];
  // normalized list of companies
  const companies: Array<{ id: string; name: string }> = companiesRaw.map(
    (c) => ({
      id: String(c.id),
      name: String(
        (c as any).legal_entity_name ?? (c as any).display_name ?? "Unnamed",
      ),
    }),
  );

  // when user picks a company, we’re in 'select' mode -- clicking the text links switches mode
  const formName =
    mode === "select"
      ? `${baseForm}`
      : mode === "invite"
        ? `${baseForm}-invite`
        : `${baseForm}-manual`;

  return (
    <div className="space-y-4">
      <FormDropdown
        label="Select your company"
        required
        value={selection}
        options={companies.map((c) => ({ id: c.id, name: c.name }))}
        setter={(v: string | number | null) => {
          const val = String(v ?? "");
          setSelection(val);
          if (val) setMode("select"); // choosing a company forces 'select' mode
        }}
        className="w-full"
      />

      <p className="text-xs text-muted-foreground">
        Company not in our list?{" "}
        <button
          type="button"
          className="underline underline-offset-4 hover:no-underline mr-2"
          onClick={() => {
            setMode("invite");
            setSelection(""); // ensure no company_id
          }}
        >
          Invite them to fill it in
        </button>
        or{" "}
        <button
          type="button"
          className="underline underline-offset-4 hover:no-underline"
          onClick={() => {
            setMode("manual");
            setSelection("");
          }}
        >
          I’ll fill details manually
        </button>
        .
      </p>

      {mode === "invite" && <EntityFieldsOnly form={`${baseForm}-invite`} />}
      {mode === "manual" && <EntityFieldsOnly form={`${baseForm}-manual`} />}

      {/* Main form */}
      <DynamicForm form={formName} />
    </div>
  );
}
