"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMe, useUpdateMyNotifications } from "@/hooks/use-employer-api";

export function NotificationsTab() {
  const { loading, data: me } = useMe();
  const updateNotifications = useUpdateMyNotifications();

  if (loading || !me) {
    return <Card className="p-6 text-sm text-muted-foreground">Loading...</Card>;
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="applicant-digest" className="text-sm font-medium text-gray-900">
            Daily applicant digest
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            Get an email whenever your listings receive new applicants.
          </p>
        </div>
        <Switch
          id="applicant-digest"
          checked={me.receives_applicant_digest}
          disabled={updateNotifications.isPending}
          onCheckedChange={(checked) => updateNotifications.mutate(checked)}
        />
      </div>
    </Card>
  );
}
