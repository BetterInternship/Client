import { redirect } from "next/navigation";

export default function SavedJobsPage() {
  redirect("/applications?tab=saved");
}
