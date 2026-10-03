import { notFound } from "next/navigation";
import { ModalPreviewGallery } from "@/components/modals/ModalPreviewGallery";

export default function ModalPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <ModalPreviewGallery />;
}
