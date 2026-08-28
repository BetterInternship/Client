"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button, Input, Label } from "@betterinternship/components";
import {
  useMe,
  useUpdateSelf,
} from "@/hooks/use-employer-api";

export function ProfileTab() {
  const { loading, data: me } = useMe();
  const updateSelf = useUpdateSelf();

  const [firstName, setFirstName] = useState<string | null>(null);
  const [middleName, setMiddleName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  if (loading || !me) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">Loading...</Card>
    );
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
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input
                  value={firstName ?? ""}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Middle name</Label>
                <Input
                  value={middleName ?? ""}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input
                  value={lastName ?? ""}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 self-end">
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
    </div>
  );
}
