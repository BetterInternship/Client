import Marquee from "@/components/animata/container/marquee";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@betterinternship/components";

interface Testimonial {
  name: string;
  image: string;
}

interface TestimonialProps {
  data: Testimonial[];
}

function TestimonialCard({
  testimonial: { image, name },
}: {
  testimonial: Testimonial;
}) {
  const { isMobile } = useAppContext();
  const router = useRouter();

  const handleSearchClick = (companyName: string) => {
    router.push(`/search?q=${encodeURIComponent(companyName)}`);
  };

  return (
    <div
      className={cn(
        isMobile ? "h-16 w-28" : "h-16 w-24",
        "overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center p-3",
      )}
      onClick={() => handleSearchClick(name)}
    >
      <img
        src={image}
        alt={name}
        className="h-full w-full object-contain"
        onError={(e) => {
          console.error(`Failed to load image: ${image}`);
          e.currentTarget.style.display = "none";
        }}
        onLoad={() => console.log(`Successfully loaded: ${image}`)}
      />
    </div>
  );
}

export default function ScrollingTestimonials({ data }: TestimonialProps) {
  return (
    <div className="w-full overflow-hidden">
      <Marquee className="[--duration:80s]" pauseOnHover applyMask={false}>
        {data.map((testimonial) => (
          <TestimonialCard key={testimonial.name} testimonial={testimonial} />
        ))}
      </Marquee>
    </div>
  );
}
