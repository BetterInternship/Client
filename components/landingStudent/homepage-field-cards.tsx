import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@betterinternship/components";
import { topCategoryArtworkBySlug } from "@/components/features/student/top/top-category-artwork";
import type { HomepageField } from "./homepage-data";
import styles from "./homepage-field-cards.module.css";

const artworkSlugs = [
  "software",
  "marketing",
  "it",
  "accounting-finance",
  "engineering-architecture",
];

/** Top-page card treatment with a compact, mixed-size homepage composition. */
export function HomepageFieldCards({ fields }: { fields: HomepageField[] }) {
  return (
    <nav aria-label="Popular internship searches">
      <ul className={styles.grid}>
        {fields.map((field, index) => {
          const artwork = topCategoryArtworkBySlug[artworkSlugs[index]];
          return (
            <li key={field.label} className={styles.item}>
              <Card className={styles.card}>
                <Link href={field.href} className={styles.link}>
                  <div className={styles.art} aria-hidden="true">
                    {artwork && (
                      <Image
                        src={artwork.primary}
                        alt=""
                        width={384}
                        height={384}
                        sizes={
                          index === 0
                            ? "(min-width: 1024px) 240px, 140px"
                            : "(max-width: 767px) 90px, 110px"
                        }
                      />
                    )}
                  </div>
                  <div className={styles.label}>
                    <h3>{field.label}</h3>
                    <ArrowRight className={styles.arrow} aria-hidden="true" />
                  </div>
                </Link>
              </Card>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
