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
      name: c.legal_entity_name,
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
      <h3 className="text-sm font-semibold text-gray-700">Employer</h3>

      {/* SELECT MODE: show dropdown + actions */}
      {mode === "select" ? (
        <>
          <FormDropdown
            label="Select your company"
            required
            value={selection}
            options={companies.map((c) => ({ id: c.id, name: c.name }))}
            setter={(v: string | number | null) => {
              const val = String(v ?? "");
              setSelection(val);
              if (val) setMode("select");
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
              disabled={isLoading || !!error}
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
              disabled={isLoading || !!error}
            >
              I’ll fill details manually
            </button>
            .
          </p>
        </>
      ) : (
        /* INVITE/MANUAL MODE: hide dropdown, show back-to-select */
        <div className="flex items-center justify-between rounded-[0.33em] border bg-card px-3 py-2 bg-gray-200">
          <div className="text-sm">
            {mode === "invite"
              ? "Invite the company to complete details"
              : "Fill company details manually"}
          </div>
          <button
            type="button"
            className="text-xs underline underline-offset-4 hover:no-underline"
            onClick={() => {
              setMode("select");
              setSelection("");
            }}
          >
            Back to company picker
          </button>
        </div>
      )}

      {mode === "invite" && (
        <>
          <EntityFieldsOnly form={`${baseForm}-invite`} />
        </>
      )}
      {mode === "manual" && (
        <>
          <EntityFieldsOnly form={`${baseForm}-manual`} />
        </>
      )}

      {/* Main form */}
      <DynamicForm form={formName} />
    </div>
  );
}
