import { StudentNavigation } from "@/components/features/student/navigation/student-navigation";

export function HomepageHeader() {
  return (
    <StudentNavigation
      preset="public"
      links={[
        { label: "Guides", href: "/guides" },
        {
          label: "For Companies",
          href:
            process.env.NEXT_PUBLIC_CLIENT_HIRE_URL ||
            "https://hire.betterinternship.com",
        },
      ]}
    />
  );
}
