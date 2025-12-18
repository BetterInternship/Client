import { useState, useEffect } from "react";
import { UserService } from "@/lib/api/services";

export interface DegreeOption {
  name: string;
}

/**
 * Hook to fetch unique degree programs, optionally filtered by university
 */
export const useDegreeOptions = (universityId?: string | null) => {
  const [degrees, setDegrees] = useState<DegreeOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchDegrees = async () => {
      setLoading(true);
      try {
        const result = await UserService.getUniqueDegrees(
          universityId ?? undefined,
        );
        if (!cancelled && result.degrees) {
          setDegrees(result.degrees.map((name: string) => ({ name })));
        }
      } catch (error) {
        console.error("Failed to fetch degrees:", error);
        // Fallback to empty array on error
        if (!cancelled) {
          setDegrees([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Only fetch if we have data to query
    void fetchDegrees();

    return () => {
      cancelled = true;
    };
  }, [universityId]);

  return { degrees, loading };
};
