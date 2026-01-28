"use client";

/**
 * Verified employers page
 * - Owns the modal instance: const { Modal, open, close } = useModal("register-modal")
 * - Passes open to the Button, Modal/close to the Modal component.
 */

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import {
  ListShell,
  RowCard,
  Meta,
  LastLogin,
  ListSummary,
} from "@/components/features/hire/god/ui";
import {
  GenerateMagicLinkButton,
  GenerateMagicLinkModal,
  RegisterEmployerButton,
  RegisterEmployerModal,
} from "@/components/features/hire/god/RegisterEmployerModal";
import { BoolBadge } from "@/components/ui/badge";
import { useEmployers } from "@/lib/api/god.api";
import { useModal } from "@/hooks/use-modal";
import { useAuthContext } from "@/app/hire/authctx";
import { useQueryClient } from "@tanstack/react-query";

export default function VerifiedEmployersPage() {
  const router = useRouter();
  const employers = useEmployers();
  const queryClient = useQueryClient();
  const { loginAs: login_as } = useAuthContext();

  const {
    Modal: RegisterModal,
    open: openRegister,
    close: closeRegister,
  } = useModal("register-modal");

  const {
    Modal: MagicLinkModal,
    open: openMagicLink,
    close: closeMagicLink,
  } = useModal("magic-link-modal");

  const [search, setSearch] = useState<string | null>(null);
  const [hideNoApps, setHideNoApps] = useState(false);
  const [authorizingId, setAuthorizingId] = useState<string | null>(null);

  const setSearchQuery = (id?: number | string | null) =>
    setSearch(id?.toString() ?? null);

  const options = useMemo(
    () =>
      employers.data.map((e: any) => ({
        id: e.id ?? "",
        name: e.name ?? "",
      })),
    [employers.data],
  );

  const authorizeAs = async (employer_id: string) => {
    try {
      setAuthorizingId(employer_id);
      await login_as(employer_id);
      router.push("/dashboard");
    } catch (err) {
      console.error("[authorizeAs] failed:", err);
    } finally {
      setAuthorizingId(null);
    }
  };

  const verifiedOnly = useMemo(
    () => employers.data.filter((e: any) => e.is_verified),
    [employers.data],
  );

  const filtered = verifiedOnly
    .filter((e: any) => !hideNoApps || e?.applications?.length)
    .filter((e: any) => {
      if (!search) return true;
      return (
        e.name?.toLowerCase().includes(search.toLowerCase()) || e.id === search
      );
    })
    .toSorted((a: any, b: any) => a.name?.localeCompare(b.name ?? "") ?? 0);

  const rows = filtered.map((e: any) => {
    const lastTs = e?.last_session?.timestamp
      ? new Date(e.last_session.timestamp).getTime()
      : undefined;

    return (
      <RowCard
        key={e.id}
        title={e.name}
        metas={
          <>
            <BoolBadge
              state={e.is_verified}
              onValue="verified"
              offValue="unverified"
            />
            <Meta>{e.applications?.length ?? 0} applications</Meta>

            <LastLogin ts={lastTs} />
          </>
        }
        leftActions={
          <>
            <Button
              scheme="primary"
              size="xs"
              onClick={(ev) => {
                ev.stopPropagation();
                authorizeAs(e.id ?? "");
              }}
              disabled={authorizingId === (e.id ?? "")}
            >
              {authorizingId === (e.id ?? "") ? "Opening…" : "View"}
            </Button>
          </>
        }
        more={
          <div className="space-y-2 text-sm">
            <div>
              Employer ID: <code className="text-slate-500">{e.id}</code>
            </div>
            <div>
              Created:{" "}
              {e.created_at ? new Date(e.created_at).toLocaleString() : "—"}
            </div>
            <div>Contact: {e.contact_email || "—"}</div>
          </div>
        }
      />
    );
  });

  const toolbar = (
    <div className="flex justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <ListSummary
          label="Verified employers"
          total={verifiedOnly.length}
          visible={filtered.length}
        />
        <Autocomplete
          setter={setSearchQuery}
          options={options}
          className="w-80"
          placeholder="Search employer..."
        />
        {/* Button gets the owner’s open() via props */}
        <RegisterEmployerButton onOpen={openRegister} />
        <GenerateMagicLinkButton onOpen={openMagicLink} />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={hideNoApps}
            onChange={(e) => setHideNoApps(e.target.checked)}
          />
          Hide without applications
        </label>
      </div>
      <div className="px-2">
        <Button
          className="bg-warning hover:bg-warning/80"
          disabled={employers.isFetching}
          onClick={() =>
            void queryClient.invalidateQueries({ queryKey: ["god-employers"] })
          }
        >
          {employers.isFetching ? "Refreshing Cache..." : "Refresh Cache"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <ListShell toolbar={toolbar} fullWidth>
        {rows}
      </ListShell>

      <RegisterEmployerModal Modal={RegisterModal} onClose={closeRegister} />
      <GenerateMagicLinkModal
        Modal={MagicLinkModal}
        onClose={closeMagicLink}
        employers={filtered
          .filter((e) => e.id && e.name)
          .map((e) => ({ id: e.id!, name: e.name! }))}
      />
    </>
  );
}
