"use client"

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import React, { useEffect, useRef, useState } from 'react';

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

const Scrollbar = ({children} : {children: React.ReactNode}) => {
  const contentRef = useRef<HTMLDivElement>(null);
	const scrollTrackRef = useRef<HTMLDivElement>(null);
	const scrollThumbRef = useRef<HTMLDivElement>(null);
	const observer = useRef<ResizeObserver | null>(null);

	const [thumbHeight, setThumbHeight] = useState(20);
	const [isDragging, setIsDragging] = useState(false);
	const [scrollStartPosition, setScrollStartPosition] = useState<number>(0);
	const [initialContentScrollTop, setInitialContentScrollTop] =
		useState<number>(0);

	function handleResize() {
		if (scrollTrackRef.current && contentRef.current) {
			const { clientHeight: trackSize } = scrollTrackRef.current;
			const { clientHeight: contentVisible, scrollHeight: contentTotalHeight } =
				contentRef.current;
			setThumbHeight(
				Math.max((contentVisible / contentTotalHeight) * trackSize, 20)
			);
		}
	}

  function handleThumbPosition() {
		if (
			!contentRef.current ||
			!scrollTrackRef.current ||
			!scrollThumbRef.current
		) {
			return;
		}

		const { scrollTop: contentTop, scrollHeight: contentHeight } =
			contentRef.current;
		const { clientHeight: trackHeight } = scrollTrackRef.current;

		let newTop = (contentTop / contentHeight) * trackHeight;
		newTop = Math.min(newTop, trackHeight - thumbHeight);

		const thumb = scrollThumbRef.current;
		requestAnimationFrame(() => {
			thumb.style.top = `${newTop}px`;
		});
	}

	useEffect(() => {
		if (contentRef.current) {
			const content = contentRef.current;
			observer.current = new ResizeObserver(() => {
				handleResize();
			});
			observer.current.observe(content);
			content.addEventListener('scroll', handleThumbPosition);
			return () => {
				observer.current?.unobserve(content);
				content.removeEventListener('scroll', handleThumbPosition);
			};
		}
	}, []);

	function handleThumbMousedown(e: React.MouseEvent<HTMLDivElement>) {
		e.preventDefault();
		e.stopPropagation();
		setScrollStartPosition(e.clientY);
		if (contentRef.current)
			setInitialContentScrollTop(contentRef.current.scrollTop);
		setIsDragging(true);
	}

	function handleThumbMouseup(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		if (isDragging) {
			setIsDragging(false);
		}
	}

	function handleThumbMousemove(e: MouseEvent) {
		if (contentRef.current) {
			e.preventDefault();
			e.stopPropagation();
			if (isDragging) {
				const {
					scrollHeight: contentScrollHeight,
					clientHeight: contentClientHeight,
				} = contentRef.current;

				const deltaY =
					(e.clientY - scrollStartPosition) *
					(contentClientHeight / thumbHeight);

				const newScrollTop = Math.min(
					initialContentScrollTop + deltaY,
					contentScrollHeight - contentClientHeight
				);

				contentRef.current.scrollTop = newScrollTop;
			}
		}
	}

	useEffect(() => {
		document.addEventListener('mousemove', handleThumbMousemove);
		document.addEventListener('mouseup', handleThumbMouseup);
		return () => {
			document.removeEventListener('mousemove', handleThumbMousemove);
			document.removeEventListener('mouseup', handleThumbMouseup);
		};
	}, [handleThumbMousemove, handleThumbMouseup]);

  function handleTrackClick(e: React.MouseEvent<HTMLDivElement>) {
		e.preventDefault();
		e.stopPropagation();
		const { current: track } = scrollTrackRef;
		const { current: content } = contentRef;
		if (track && content) {
			const { clientY } = e;
			const target = e.target as HTMLDivElement;
			const rect = target.getBoundingClientRect();
			const trackTop = rect.top;
			const thumbOffset = -(thumbHeight / 2);
			const clickRatio =
				(clientY - trackTop + thumbOffset) / track.clientHeight;
			const scrollAmount = Math.floor(clickRatio * content.scrollHeight);
			content.scrollTo({
				top: scrollAmount,
				behavior: 'smooth',
			});
		}
	}

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_50px] h-full overflow-hidden relative">
    {/* content */}
    <div 
      className="overflow-auto scrollbar-none h-[90vh] px-4"
      ref={contentRef}
    >
      {children}
    </div>
    
    {/* scrollbar */}
    <div className="grid grid-flow-row grid-rows-[auto_1fr_auto] gap-4 p-4 place-items-center">
      {/* track & thumb */}
      <div 
        className="block h-full relative w-4"
        role="scrollbar"
        aria-controls="custom-scrollbars-content"
      >
        {/* track */}
        <div
          className="absolute bottom-0 top-0 cursor-pointer"
          ref={scrollTrackRef}
          onClick={handleTrackClick}
          style={{ cursor: isDragging ? 'grabbing' : undefined }}
        ></div>
        {/* thumb */}
        <div
          className="absolute"
          ref={scrollThumbRef}
          onMouseDown={handleThumbMousedown}
          style={{
            height: `${thumbHeight}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        ></div>
      </div>
    </div>
  </div>
  )
}

export { ScrollArea, ScrollBar, Scrollbar };

