"use client";

import * as React from "react";
import Fade from "embla-carousel-fade";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import { slides } from "./slides";

export function RegisterCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();

  React.useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      api.scrollNext();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      plugins={[Fade()]}
      className="w-full h-full"
    >
      <CarouselContent className="h-full">
        {slides.map((slide) => (
          <CarouselItem
            key={slide.id}
            className="h-full relative basis-full flex-shrink-0"
          >
            <div className="w-full h-[calc(100vh-1.5rem)] overflow-hidden">
              {slide.content}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
