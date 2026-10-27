import { notFound } from "next/navigation";
import { PubmatPlayground } from "./playground";

export default function PubmatPlaygroundPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <PubmatPlayground />;
}
