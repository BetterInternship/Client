"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  useRemoveMember,
} from "@/hooks/use-employer-api";
import { getFullName } from "@/lib/profile";

const STATUS_BADGE_TYPE: Record<
  EmployerTeamMember["status"],
  "primary" | "warning" | "destructive"
> = {
  Active: "primary",
  Pending: "warning",
  Disabled: "destructive",
};

export function TeamTab() {
  const { loading, data: members } = useTeam();
  const inviteMember = useInviteMember();
  const resendInvite = useResendInvite();
  const changeRole = useChangeMemberRole();
  const deactivateMember = useDeactivateMember();
  const reactivateMember = useReactivateMember();
  const removeMember = useRemoveMember();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<EmployerUserRole>("MEMBER");
  const [inviteError, setInviteError] = useState<string | null>(null);

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
              <TableHead>Status</TableHead>
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
                onDeactivate={() => deactivateMember.mutate(member.id)}
                onReactivate={() => reactivateMember.mutate(member.id)}
                onRemove={() => removeMember.mutate(member.id)}
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
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as EmployerUserRole)}
                className="mt-1 w-full h-8 rounded-[0.33em] border border-gray-300 px-[0.75em] text-sm cursor-pointer"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
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
  onRemove,
}: {
  member: EmployerTeamMember;
  blockedAsLastAdmin: boolean;
  onResendInvite: () => void;
  onChangeRole: (role: EmployerUserRole) => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onRemove: () => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const name = getFullName(member) || member.email;
  const lastAdminTitle = blockedAsLastAdmin
    ? "Your team needs at least one active admin."
    : undefined;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{member.email}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <select
            value={member.role}
            disabled={blockedAsLastAdmin}
            title={lastAdminTitle}
            onChange={(e) => onChangeRole(e.target.value as EmployerUserRole)}
            className="h-8 rounded-[0.33em] border border-gray-300 px-2 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          {member.is_owner && <Badge type="accent">Owner</Badge>}
        </div>
      </TableCell>
      <TableCell>
        <Badge type={STATUS_BADGE_TYPE[member.status]}>{member.status}</Badge>
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
          {!confirmRemove ? (
            <Button
              variant="outline"
              size="sm"
              disabled={blockedAsLastAdmin}
              title={lastAdminTitle}
              className="text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmRemove(true)}
            >
              Remove
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={onRemove}
              >
                Confirm
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmRemove(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
