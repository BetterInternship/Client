"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./homepage-testimonials.module.css";

interface Testimonial {
  quote: string;
  name: string;
  program: string;
  role: string;
  setup: string;
  initials: string;
}

export function HomepageTestimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <section
      className={`${styles.section} home-testimonials home-reveal`}
      aria-labelledby={headingId}
    >
      <div className="home-section-heading">
        <h2 id={headingId}>Loved by students</h2>
        <p>What students are saying about BetterInternship.</p>
      </div>
      <div
        ref={root}
        className={styles.marquee}
        role="region"
        aria-label="Student testimonials"
        aria-roledescription="carousel"
        data-paused={!visible}
      >
        <div
          className={styles.viewport}
          tabIndex={0}
          aria-label="Student testimonials. Focus or hover to pause the carousel."
        >
          <div className={styles.track}>
            {[0, 1].map((group) => (
              <div
                className={styles.group}
                key={group}
                aria-hidden={group === 1 ? true : undefined}
              >
                {testimonials.map((student) => (
                  <figure className={styles.testimonial} key={student.name}>
                    <blockquote className={styles.quote}>
                      “{student.quote}”
                    </blockquote>
                    <figcaption className={styles.author}>
                      <span className={styles.avatar} aria-hidden="true">
                        {student.initials}
                      </span>
                      <div className={styles.identity}>
                        <strong>{student.name}</strong>
                        <span>{student.program}</span>
                      </div>
                    </figcaption>
                    <div className={styles.context}>
                      {student.role} · {student.setup}
                    </div>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
