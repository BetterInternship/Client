"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmployerTeamMember, EmployerUserRole } from "@/lib/db/db.types";
import {
  useTeam,
  useInviteMember,
  useResendInvite,
  useChangeMemberRole,
  useDeactivateMember,
  useReactivateMember,
} from "@/hooks/use-employer-api";
import { getFullName } from "@/lib/profile";

/** Plain <select> — `@tailwindcss/forms` (tailwind.config.ts) already paints
 * every bare select with its own chevron background-image, so adding a second,
 * manually-positioned icon here just stacked a duplicate arrow on top of it. */
function RoleSelect({
  value,
  onChange,
  disabled,
  title,
  className,
}: {
  value: EmployerUserRole;
  onChange: (role: EmployerUserRole) => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      title={title}
      onChange={(e) => onChange(e.target.value as EmployerUserRole)}
      className={cn(
        "h-8 w-full rounded-[0.33em] border border-gray-300 pl-2 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <option value="MEMBER">Member</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}

/** Oldest live admin other than `excludeId` — mirrors the server's fallback
 * (resolveEmployerAccount) so the confirmation dialog can name the new owner
 * before the request is even sent. */
function findFallbackAdmin(
  members: EmployerTeamMember[],
  excludeId: string,
): EmployerTeamMember | null {
  const candidates = members
    .filter(
      (m) => m.role === "ADMIN" && m.status !== "Disabled" && m.id !== excludeId,
    )
    .sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  return candidates[0] ?? null;
}

export function TeamTab() {
  const { loading, data: members } = useTeam();
  const inviteMember = useInviteMember();
  const resendInvite = useResendInvite();
  const changeRole = useChangeMemberRole();
  const deactivateMember = useDeactivateMember();
  const reactivateMember = useReactivateMember();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<EmployerUserRole>("MEMBER");
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Deactivating the owner actually transfers ownership server-side (real
  // transfer, not just a resolver fallback — deactivation has no undo here,
  // there's no delete path) — confirm who it's transferring to first.
  const [ownerTransferTarget, setOwnerTransferTarget] =
    useState<EmployerTeamMember | null>(null);

  // Last-admin protection (plan D9/§6.6) — computed client-side purely to
  // disable+explain the destructive actions before the request 409s; the API
  // is the actual source of truth for this rule.
  const liveAdminCount = useMemo(
    () => members.filter((m) => m.role === "ADMIN" && m.status !== "Disabled").length,
    [members],
  );

  const isLastLiveAdmin = (member: EmployerTeamMember) =>
    member.role === "ADMIN" && member.status !== "Disabled" && liveAdminCount <= 1;

  const submitInvite = async () => {
    setInviteError(null);
    if (!inviteEmail.trim()) {
      setInviteError("Email is required.");
      return;
    }
    try {
      const response = await inviteMember.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      if (!response.success) {
        setInviteError(response.message || "Could not send invite.");
        return;
      }
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("MEMBER");
    } catch {
      setInviteError("Could not send invite.");
    }
  };

  const handleDeactivateClick = (member: EmployerTeamMember) => {
    if (member.is_owner) {
      setOwnerTransferTarget(member);
      return;
    }
    deactivateMember.mutate(member.id);
  };

  const confirmOwnerDeactivate = () => {
    if (!ownerTransferTarget) return;
    deactivateMember.mutate(ownerTransferTarget.id);
    setOwnerTransferTarget(null);
  };

  const fallbackAdmin = ownerTransferTarget
    ? findFallbackAdmin(members, ownerTransferTarget.id)
    : null;

  if (loading) {
    return <Card className="p-6 text-sm text-muted-foreground">Loading...</Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setInviteOpen(true)}>Invite teammate</Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TeamMemberRow
                key={member.id}
                member={member}
                blockedAsLastAdmin={isLastLiveAdmin(member)}
                onResendInvite={() => resendInvite.mutate(member.id)}
                onChangeRole={(role) =>
                  changeRole.mutate({ userId: member.id, role })
                }
                onDeactivate={() => handleDeactivateClick(member)}
                onReactivate={() => reactivateMember.mutate(member.id)}
              />
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@company.com"
              />
            </div>
            <div>
              <Label>Role</Label>
              <RoleSelect value={inviteRole} onChange={setInviteRole} className="mt-1" />
            </div>
            {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitInvite} disabled={inviteMember.isPending}>
              {inviteMember.isPending ? "Sending..." : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!ownerTransferTarget}
        onOpenChange={(open) => !open && setOwnerTransferTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer ownership?</DialogTitle>
          </DialogHeader>
          {ownerTransferTarget && (
            <p className="text-sm text-muted-foreground">
              {fallbackAdmin ? (
                <>
                  Deactivating <strong>{getFullName(ownerTransferTarget) || ownerTransferTarget.email}</strong> will
                  transfer company ownership to{" "}
                  <strong>{getFullName(fallbackAdmin) || fallbackAdmin.email}</strong>.
                  This can&apos;t be undone by reactivating {ownerTransferTarget.email}{" "}
                  later.
                </>
              ) : (
                <>
                  No other active admin is available to take over ownership.
                  Deactivating <strong>{ownerTransferTarget.email}</strong> will leave
                  ownership as-is until you promote another admin.
                </>
              )}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOwnerTransferTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmOwnerDeactivate}
              disabled={deactivateMember.isPending}
            >
              {deactivateMember.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamMemberRow({
  member,
  blockedAsLastAdmin,
  onResendInvite,
  onChangeRole,
  onDeactivate,
  onReactivate,
}: {
  member: EmployerTeamMember;
  blockedAsLastAdmin: boolean;
  onResendInvite: () => void;
  onChangeRole: (role: EmployerUserRole) => void;
  onDeactivate: () => void;
  onReactivate: () => void;
}) {
  const name = getFullName(member) || member.email;
  const lastAdminTitle = blockedAsLastAdmin
    ? "Your team needs at least one active admin."
    : undefined;
  // The owner is always an admin — never editable, regardless of last-admin
  // state (which only governs everyone else).
  const roleLockedTitle = member.is_owner
    ? "The owner is always an admin and can't be changed."
    : lastAdminTitle;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium flex items-center gap-2 flex-wrap">
          {name}
          {member.is_owner && <Badge type="accent">Owner</Badge>}
          {member.status === "Pending" && <Badge type="warning">Pending</Badge>}
          {member.status === "Disabled" && (
            <Badge type="destructive">Deactivated</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">{member.email}</div>
      </TableCell>
      <TableCell>
        <RoleSelect
          value={member.role}
          onChange={onChangeRole}
          disabled={member.is_owner || blockedAsLastAdmin}
          title={roleLockedTitle}
        />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {member.last_active
          ? new Date(member.last_active).toLocaleDateString()
          : "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {member.status === "Pending" && (
            <Button variant="outline" size="sm" onClick={onResendInvite}>
              Resend invite
            </Button>
          )}
          {member.status === "Disabled" ? (
            <Button variant="outline" size="sm" onClick={onReactivate}>
              Reactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={blockedAsLastAdmin}
              title={lastAdminTitle}
              onClick={onDeactivate}
            >
              Deactivate
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
