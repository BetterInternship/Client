"use client";

import { Fragment, type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const ACCESS_CODE_SLOT_CLASS =
  "h-11 w-11 rounded-[0.33em] border border-gray-300 bg-white text-base font-semibold text-gray-900 shadow-inner-soft first:rounded-[0.33em] first:border-l last:rounded-[0.33em]";

const accessCodeGroups = [
  [0, 1, 2],
  [3, 4, 5],
];

const normalizeAccessCode = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);

export function FormsAccessGate({
  onAccessGranted,
}: {
  onAccessGranted: () => void;
}) {
  const [accessCode, setAccessCode] = useState("");
  const isAccessCodeComplete = accessCode.length === 6;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAccessCodeComplete) return;
    onAccessGranted();
  };

  return (
    <motion.div
      className="flex h-full min-h-0 w-full items-center justify-center bg-gray-50 px-4 py-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <Card className="w-full max-w-lg overflow-hidden border-gray-200/90 p-0 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 p-6 sm:p-7"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Contact your coordinator
              </h1>
              <p className="text-sm leading-6 text-gray-600">
                Ask your coordinator for the code to access your internship
                forms.
              </p>
            </div>
          </div>

          <div className="space-y-2 mx-auto">
            <label className="sr-only" htmlFor="forms-access-code">
              Access code
            </label>
            <InputOTP
              id="forms-access-code"
              maxLength={6}
              value={accessCode}
              onChange={(value) => setAccessCode(normalizeAccessCode(value))}
              autoComplete="one-time-code"
              autoFocus
              inputMode="text"
              containerClassName="justify-center gap-2 sm:justify-start"
            >
              {accessCodeGroups.map((group, groupIndex) => (
                <Fragment key={group.join("")}>
                  <InputOTPGroup className="gap-2">
                    {group.map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className={ACCESS_CODE_SLOT_CLASS}
                      />
                    ))}
                  </InputOTPGroup>
                  {groupIndex === 0 && (
                    <span
                      aria-hidden="true"
                      className="flex h-11 items-center text-lg font-semibold text-gray-400"
                    >
                      -
                    </span>
                  )}
                </Fragment>
              ))}
            </InputOTP>
          </div>

          <Button
            type="submit"
            size="md"
            className="h-11 w-full"
            disabled={!isAccessCodeComplete}
          >
            Access Your Forms
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
