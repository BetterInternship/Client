"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LayoutGrid, X } from "lucide-react";
import { topCategoryArtworkBySlug } from "@/components/features/student/top/top-category-artwork";
import type { HomepageField } from "./homepage-data";
import styles from "./homepage-field-picker.module.css";

const artworkSlugs: Record<string, string> = {
  "Data & Analytics": "data-analytics",
  Software: "software",
  IT: "it",
  "Accounting & Finance": "accounting-finance",
  "Operations & Human Resources": "operations-human-resources",
  Marketing: "marketing",
  "Creative & Multimedia": "creative-multimedia",
  Legal: "legal",
  "Engineering & Architecture": "engineering-architecture",
};

export function HomepageFieldPicker({ fields }: { fields: HomepageField[] }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={styles.trigger}>
        <LayoutGrid size={21} aria-hidden="true" />
        <span>Explore a field</span>
        <ArrowRight size={20} aria-hidden="true" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.modal} aria-describedby={undefined}>
          <div className={styles.header}>
            <Dialog.Title className={styles.title}>
              Explore a field
            </Dialog.Title>
            <Dialog.Close
              className={styles.close}
              aria-label="Close field picker"
            >
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>
          <ul className={styles.grid}>
            {fields.map((field) => {
              const artwork =
                topCategoryArtworkBySlug[artworkSlugs[field.label]];
              return (
                <li key={field.label}>
                  <Dialog.Close asChild>
                    <Link href={field.href} className={styles.card}>
                      <div className={styles.art} aria-hidden="true">
                        {artwork && (
                          <Image
                            src={artwork.primary}
                            width={384}
                            height={384}
                            sizes="(max-width: 480px) 100px, 120px"
                            alt=""
                          />
                        )}
                      </div>
                      <div className={styles.label}>
                        <span>{field.label}</span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </div>
                    </Link>
                  </Dialog.Close>
                </li>
              );
            })}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
