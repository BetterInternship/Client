/**
 * @ Author: BetterInternship
 * @ Create Time: 2025-12-30 07:06:04
 * @ Modified time: 2026-01-02 21:30:38
 * @ Description:
 *
 * Makes it easier to manage signatory account state across files.
 * // ! MERGE THIS WITH THE FORM FILLER CONTEXT PROBABLY
 */

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ISignContext {
  hasAgreed?: boolean;
  setRequiredSignatures: (requiredSignatureFieldIds: string[]) => void;
  setHasAgreedForSignature: (
    signatureFieldId: string,
    signatureValue: string,
    hasAgreed: boolean,
  ) => void;
}

type ISignatureAgreementDict = Record<
  string,
  { hasAgreed?: boolean; signatureValue?: string }
>;

const SignContext = createContext({} as ISignContext);

export const useSignContext = () => useContext(SignContext);

export const SignContextBridge = ({
  value,
  children,
}: {
  value: ISignContext;
  children: React.ReactNode;
}) => {
  return <SignContext.Provider value={value}>{children}</SignContext.Provider>;
};

export const SignContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [signatureAgreementDict, setSignatureAgreementDict] =
    useState<ISignatureAgreementDict>({});

  // Should be called to init this context
  const setRequiredSignatures = useCallback((requiredSignatureFieldIds: string[]) => {
    setSignatureAgreementDict((prev) => {
      const requiredSignatures: ISignatureAgreementDict = {};
      for (const requiredSignature of requiredSignatureFieldIds) {
        // Preserve existing agreement data if it exists
        requiredSignatures[requiredSignature] = prev[requiredSignature] || {};
      }
      return requiredSignatures;
    });
  }, []);

  // Checks whether or not all the needed signatures are good
  const hasAgreed = useMemo(
    () =>
      Object.values(signatureAgreementDict).every(
        (signatureAgreement) =>
          !!signatureAgreement.hasAgreed &&
          !!signatureAgreement.signatureValue?.trim(),
      ),
    [signatureAgreementDict],
  );

  // Update the dict
  const setHasAgreedForSignature = useCallback(
    (signatureFieldId: string, signatureValue: string, hasAgreed: boolean) => {
      setSignatureAgreementDict((prev) => {
        const current = prev[signatureFieldId];
        if (
          current?.hasAgreed === hasAgreed &&
          current?.signatureValue === signatureValue
        ) {
          return prev;
        }

        return {
          ...prev,
          [signatureFieldId]: { hasAgreed, signatureValue },
        };
      });
    },
    [],
  );

  return (
    <SignContext.Provider
      value={{
        hasAgreed,
        setHasAgreedForSignature,
        setRequiredSignatures,
      }}
    >
      {children}
    </SignContext.Provider>
  );
};
