"use client";
import ContentLayout from "@/components/features/hire/content-layout";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";
import { BadgeInfo, Calendar, Facebook, LucideMessageCircleMore, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const { isMobile } = useAppContext();
  
  return (
    <ContentLayout>
      <div className={cn(
        "flex flex-col gap-4 w-full py-4",
        isMobile
        ? "px-1"
        : "px-4"
      )}>
        <h3 className="text-primary tracking-tighter">Help center</h3>
        <div className="grid gap-2 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          <Card
            className="flex flex-col gap-2"
          >
            <h4 className="tracking-tighter">Contact us</h4>
            <Link href="mailto://hello@betterinternship.com">
              <span className="flex items-center gap-2">
                <Mail size={20} />
                hello@betterinternship.com
              </span>
            </Link>
            <Link href="tel://09276604999">
              <span className="flex items-center gap-2">
                <Phone size={20} />
                0927 660 4999
              </span>
            </Link>
            <Link href="viber://add?number=639276604999">
              <span className="flex items-center gap-2">
                <LucideMessageCircleMore size={20} />
                Viber
              </span>
            </Link>
            <Link href="viber://add?number=639276604999">
              <span className="flex items-center gap-2">
                <Facebook size={20} />
                Facebook
              </span>
            </Link>
          </Card>
          <Link href="https://calendar.app.google/boXRU8HEkisZT95D6">
            <Card
              className="flex flex-col gap-4 h-[100%] p-16 hover:bg-primary hover:text-primary-foreground"
            >
              <Calendar size={48} />
              <span>
                Need to book a demo with us?
              </span>
            </Card>
          </Link>
          <Link href="https://www.canva.com/design/DAG0_LY-Zxs/lsZi5qpuLa27Ze1fLgo9Kg/edit">
            <Card
                className="flex flex-col gap-4 p-16 h-[100%] hover:bg-primary hover:text-primary-foreground"
            >
              <BadgeInfo size={48} />
              <span>
                View the guide
              </span>
            </Card>
          </Link>
        </div>
      </div>
    </ContentLayout>
  )
};