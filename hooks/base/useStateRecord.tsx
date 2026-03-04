/**
 * @ Author: BetterInternship
 * @ Create Time: 2026-03-04 14:26:13
 * @ Modified time: 2026-03-04 14:47:51
 * @ Description:
 *
 * This seems to be a very common use case.
 *
 */

import { useState } from "react";

export const useStateRecord = <T = string,>(
  initialState: Record<string, T>,
) => {
  const [record, setRecord] = useState<Record<string, T>>(initialState);

  const setOne = (key: string, value: T) => {
    setRecord({
      ...record,
      [key]: value,
    });
  };

  const setMany = (newRecord: Record<string, T>) => {
    setRecord({
      ...record,
      ...newRecord,
    });
  };

  const clearOne = (key: string) => {
    const recordBase = { ...record };
    delete recordBase[key];
    setRecord(recordBase);
  };

  const clearAll = () => {
    setRecord({});
  };

  const overwrite = (newRecord: Record<string, T>) => {
    setRecord(newRecord);
  };

  return [record, { setOne, setMany, clearOne, clearAll, overwrite }] as const;
};
