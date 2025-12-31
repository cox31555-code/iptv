import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AD_SLOT_ZONE_MAP,
  AD_SLOT_REFRESH_MAP,
  PRIMARY_AD_ZONE,
  DEFAULT_SLOT_REFRESH_INTERVAL,
  AdSlotKey,
} from '../constants.ts';
import { registerAdSlot } from '../utils/adSlotRegistry.ts';
import { observeAdElement } from '../utils/adViewability.ts';

interface AdSlotProps {
  slotKey: AdSlotKey;
  className?: string;
  label?: string;
  refreshInterval?: number;
  autoLoad?: boolean;
}

const baseClassName =
  'relative w-full rounded-2xl border border-white/5 bg-zinc-950/60 backdrop-blur-xl text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center justify-center overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.45)]';

const AdSlot: React.FC<AdSlotProps> = ({
  slotKey,
  className,
  label,
  refreshInterval,
  autoLoad = true,
}) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoneId = AD_SLOT_ZONE_MAP[slotKey] ?? PRIMARY_AD_ZONE;

  // Defensive check: Never render ads on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  const displayLabel = useMemo(() => {
    if (label) return label;
    return slotKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [label, slotKey]);

  const effectiveRefreshInterval = refreshInterval ?? AD_SLOT_REFRESH_MAP[slotKey] ?? DEFAULT_SLOT_REFRESH_INTERVAL;

  const refreshSlot = useCallback(() => {
    if (typeof window === 'undefined' || !zoneId) {
      return false;
    }

    if (window.aclib && typeof window.aclib.runAutoTag === 'function') {
      try {
        window.aclib.runAutoTag({ zoneId });
        console.log(`[AdSlot] Refreshed ${slotKey} → zone ${zoneId}`);
        return true;
      } catch (error) {
        console.error(`[AdSlot] Failed to refresh ${slotKey}`, error);
      }
    }
    return false;
  }, [slotKey, zoneId]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.setAttribute('data-zone-id', zoneId);
    containerRef.current.setAttribute('data-ad-slot', slotKey);
    observeAdElement(containerRef.current);
  }, [slotKey, zoneId]);

  useEffect(() => {
    const unregister = registerAdSlot({ key: slotKey, refresh: refreshSlot });
    return () => unregister();
  }, [slotKey, refreshSlot]);

  useEffect(() => {
    if (autoLoad) {
      refreshSlot();
    }
  }, [autoLoad, refreshSlot]);

  useEffect(() => {
    if (!effectiveRefreshInterval || typeof window === 'undefined') return;
    const intervalId = window.setInterval(() => {
      refreshSlot();
    }, effectiveRefreshInterval);
    return () => window.clearInterval(intervalId);
  }, [effectiveRefreshInterval, refreshSlot]);

  const combinedClassName = [baseClassName, className].filter(Boolean).join(' ');

  return (
    <div ref={containerRef} className={combinedClassName}>
      <span className="pointer-events-none select-none">Ad Slot · {displayLabel}</span>
    </div>
  );
};

export default AdSlot;
