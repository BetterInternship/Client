import { HeroSection, Feature } from "@/components/landingStudent/sections";
import Testimonials from "@/components/landingStudent/sections/3rdSection/testimonials";
import { Footer } from "@/components/shared/footer";
import { UserService } from "@/lib/api/services";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function isLoggedIn() {
  const cookieHeader = (await cookies()).toString();
  if (!cookieHeader) return false;

  try {
    const response = await UserService.getMyProfile({
      cache: "no-store",
      headers: {
        cookie: cookieHeader,
      },
    });

    return !!response.user;
  } catch {
    return false;
  }
}

export default async function HomePage() {
  if (await isLoggedIn()) {
    redirect("/search");
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      {/* Apply Fast */}
      <Feature />
      {/* Benefits clickable */}
      <Testimonials />

      <Footer />
    </div>
  );
}
