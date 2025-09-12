"use client";

/**
 * RegisterEmployerButton & RegisterEmployerModal (stateless)
 * - They do NOT call useModal() themselves.
 * - They receive open/close/Modal from the owner page.
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/EditForm";
import { isValidEmail } from "@/lib/utils";
import { APIClient, APIRoute } from "@/lib/api/api-client";
import { FetchResponse } from "@/lib/api/use-fetch";

export type ModalRendererProps = {
  children?: React.ReactNode;
  className?: string;
  backdropClassName?: string;
};

export function RegisterEmployerButton({ onOpen }: { onOpen: () => void }) {
  useEffect(() => console.debug("[RegisterEmployerButton] mounted"), []);
  return (
    <Button
      scheme="supportive"
      onClick={() => {
        console.debug("[RegisterEmployerButton] click -> onOpen()");
        onOpen();
      }}
    >
      Register new
    </Button>
  );
}

export function RegisterEmployerModal({
  Modal,
  onClose,
}: {
  Modal: React.ComponentType<ModalRendererProps>;
  onClose: () => void;
}) {
  const [dba, setDba] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => console.debug("[RegisterEmployerModal] mounted"), []);

  const handleRegister = async () => {
    console.debug("[RegisterEmployerModal] handleRegister START", {
      dba,
      email,
    });

    if (!isValidEmail(email)) {
      console.warn("[RegisterEmployerModal] invalid email");
      return alert("Email is not valid.");
    }
    if (!dba.length) {
      console.warn("[RegisterEmployerModal] empty DBA");
      return alert("Company Name (DBA) is required.");
    }

    setLoading(true);
    try {
      const url = APIRoute("employer").r("god", "register").build();
      console.debug("[RegisterEmployerModal] POST", url, {
        name: dba,
        user_email: email,
      });
      const res = await APIClient.post<FetchResponse>(url, {
        name: dba,
        user_email: email,
      });
      console.debug("[RegisterEmployerModal] response:", res);

      if (res?.success) {
        alert("Account created. Check email for password.");
        onClose();
        window.location.reload();
      } else {
        alert("Something went wrong. Check console.");
      }
    } catch (e) {
      console.error("[RegisterEmployerModal] POST error:", e);
      alert("Request failed. See console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <div className="flex flex-col items-center justify-center p-8 pt-0">
        <div className="text-left">
          <h1 className="font-heading font-bold text-2xl mb-4 text-gray-700">
            Register a New Employer Account
          </h1>
          <div className="flex flex-col gap-2">
            <FormInput value={dba} label="Company Name" setter={setDba} />
            <FormInput
              value={email}
              label="User Account Email"
              setter={setEmail}
            />
            <div className="mt-2 flex gap-2">
              <Button
                scheme="supportive"
                disabled={loading}
                onClick={handleRegister}
              >
                {!loading ? "Register" : "Registering..."}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
