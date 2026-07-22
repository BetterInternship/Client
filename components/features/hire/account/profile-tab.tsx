"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe, useUpdateSelf, useChangeMyPassword } from "@/hooks/use-employer-api";

export function ProfileTab() {
  const { loading, data: me } = useMe();
  const updateSelf = useUpdateSelf();
  const changePassword = useChangeMyPassword();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [middleName, setMiddleName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  if (loading || !me) {
    return <Card className="p-6 text-sm text-muted-foreground">Loading...</Card>;
  }

  const startEditingName = () => {
    setFirstName(me.first_name ?? "");
    setMiddleName(me.middle_name ?? "");
    setLastName(me.last_name ?? "");
    setNameSaved(false);
    setEditingName(true);
  };

  const saveName = async () => {
    await updateSelf.mutateAsync({
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
    });
    setEditingName(false);
    setNameSaved(true);
  };

  const submitPasswordChange = async () => {
    setPasswordError(null);
    setPasswordSaved(false);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      const response = await changePassword.mutateAsync({
        currentPassword,
        newPassword,
      });
      if (!response.success) {
        setPasswordError(response.message || "Could not change password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaved(true);
    } catch {
      setPasswordError("Could not change password.");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-4">
        <div>
          <div className="text-sm text-muted-foreground">Signed in as</div>
          <div className="font-medium">{me.email}</div>
        </div>

        {!editingName ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">
                {[me.first_name, me.middle_name, me.last_name]
                  .filter(Boolean)
                  .join(" ") || (
                  <span className="text-muted-foreground italic">Not set</span>
                )}
              </div>
            </div>
            <Button variant="outline" onClick={startEditingName}>
              Edit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>First name</Label>
                <Input
                  value={firstName ?? ""}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Label>Middle name</Label>
                <Input
                  value={middleName ?? ""}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div>
                <Label>Last name</Label>
                <Input
                  value={lastName ?? ""}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveName} disabled={updateSelf.isPending}>
                {updateSelf.isPending ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setEditingName(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        {nameSaved && !editingName && (
          <p className="text-sm text-supportive">Name updated.</p>
        )}
      </Card>

      <Card className="p-5 space-y-3">
        <div className="text-lg font-medium">Change password</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Current password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>Confirm new password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
        {passwordSaved && (
          <p className="text-sm text-supportive">Password changed successfully.</p>
        )}
        <Button
          onClick={submitPasswordChange}
          disabled={
            changePassword.isPending || !currentPassword || !newPassword
          }
        >
          {changePassword.isPending ? "Updating..." : "Update password"}
        </Button>
      </Card>
    </div>
  );
}
