import { useState, useEffect, useCallback } from "react";
import type { VehicleInfo } from "@/types/checklist";

const STORAGE_KEY = "car-vehicle-info";

function loadVehicleInfo(): VehicleInfo {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function useVehicleInfo() {
  const [info, setInfo] = useState<VehicleInfo>(loadVehicleInfo);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  }, [info]);

  const update = useCallback((partial: Partial<VehicleInfo>) => {
    setInfo((prev) => ({ ...prev, ...partial }));
  }, []);

  const clear = useCallback(() => {
    setInfo({});
  }, []);

  const hasInfo = Boolean(info.brand || info.model || info.plate || info.year);

  return { info, update, clear, hasInfo };
}
