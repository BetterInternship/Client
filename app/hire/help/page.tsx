"use client";
import ContentLayout from "@/components/features/hire/content-layout";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";
import {
  BadgeInfo,
  Bug,
  Calendar,
  Facebook,
  HelpCircle,
  LucideMessageCircleMore,
  Mail,
  Phone,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { HeaderIcon, HeaderText } from "@/components/ui/text";
import { useBlurTransition } from "@/components/animata/blur";
import {
  EMPLOYER_GUIDE,
  SUPPORT_CALENDAR,
  SUPPORT_EMAIL_LINK,
  SUPPORT_FACEBOOK,
  SUPPORT_PHONE,
  SUPPORT_PHONE_LINK,
  SUPPORT_VIBER,
} from "@/constants";

export default function HelpPage() {
  const { isMobile } = useAppContext();
  const blurTransition = useBlurTransition();

  return (
    <ContentLayout>
      <AnimatePresence>
        <motion.div
          className={cn(
            "flex flex-col gap-4 w-full py-4",
            isMobile ? "px-1" : "px-4",
          )}
          {...blurTransition}
        >
          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={HelpCircle} />
            <HeaderText>Help</HeaderText>
          </div>
          <div className="grid gap-2 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
            <Card className="flex flex-col gap-2">
              <h4 className="tracking-tighter">Contact us</h4>
              <Link href="mailto://hello@betterinternship.com">
                <span className="flex items-center gap-2">
                  <Mail size={20} />
                  hello@betterinternship.com
                </span>
              </Link>
              <Link href={SUPPORT_PHONE_LINK}>
                <span className="flex items-center gap-2">
                  <Phone size={20} />
                  {SUPPORT_PHONE}
                </span>
              </Link>
              <Link href={SUPPORT_VIBER}>
                <span className="flex items-center gap-2">
                  <LucideMessageCircleMore size={20} />
                  Viber
                </span>
              </Link>
              <Link href={SUPPORT_FACEBOOK}>
                <span className="flex items-center gap-2">
                  <Facebook size={20} />
                  Facebook
                </span>
              </Link>
            </Card>
            <Link href={SUPPORT_CALENDAR}>
              <Card className="flex flex-col gap-4 h-[100%] p-16 hover:bg-primary hover:text-primary-foreground">
                <Calendar size={48} />
                <span>Need to book a demo with us?</span>
              </Card>
            </Link>
            <Link href={EMPLOYER_GUIDE}>
              <Card className="flex flex-col gap-4 p-16 h-[100%] hover:bg-primary hover:text-primary-foreground">
                <BadgeInfo size={48} />
                <span>View the guide</span>
              </Card>
            </Link>
            <Link href={SUPPORT_EMAIL_LINK}>
              <Card className="flex flex-col gap-4 p-16 h-[100%] hover:bg-primary hover:text-primary-foreground">
                <Bug size={48} />
                <span>Found a bug? Report it to us here.</span>
              </Card>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </ContentLayout>
  );
}
