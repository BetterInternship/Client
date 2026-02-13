"use client";
import ContentLayout from "@/components/features/hire/content-layout";
import { Card } from "@/components/ui/card";
import { useAppContext } from "@/lib/ctx-app";
import { cn } from "@/lib/utils";
import { BadgeInfo, Bug, Calendar, Facebook, HelpCircle, LucideMessageCircleMore, Mail, Phone } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { HeaderIcon, HeaderText } from "@/components/ui/text";

export default function HelpPage() {
  const { isMobile } = useAppContext();
  
  return (
    <ContentLayout>
      <AnimatePresence>
        <motion.div
          className={cn(
            "flex flex-col gap-4 w-full py-4",
            isMobile
            ? "px-1"
            : "px-4"
          )}
          initial={{ scale: 0.98, filter: "blur(4px)", opacity: 0 }}
          animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >

          <div className="flex flex-row items-center gap-3 mb-2">
            <HeaderIcon icon={HelpCircle} />
            <HeaderText>Help</HeaderText>
          </div>
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
              <Link href="https://www.facebook.com/profile.php?id=61579853068043">
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
            <Link href="mailto://hello@betterinternship.com">
              <Card
                  className="flex flex-col gap-4 p-16 h-[100%] hover:bg-primary hover:text-primary-foreground"
              >
                <Bug size={48} />
                <span>
                  Found a bug? Report it to us here.
                </span>
              </Card>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </ContentLayout>
  )
};