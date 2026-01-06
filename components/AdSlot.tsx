import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AD_SLOT_ZONE_MAP,
  AD_SLOT_REFRESH_MAP,
  AD_SLOT_MIN_HEIGHTS,
  AD_ZONE_CONFIG,
  PRIMARY_AD_ZONE,
  DEFAULT_SLOT_REFRESH_INTERVAL,
  AdSlotKey,
} from '../constants.ts';
import { registerAdSlot } from '../utils/adSlotRegistry.ts';
import { observeAdElement } from '../utils/adViewability.ts';

interface AdSlotProps {
  slotKey: AdSlotKey;
  className?: string;
  refreshInterval?: number;
  autoLoad?: boolean;
}

// Base styling - empty container for AdCash to inject into
const baseClassName =
  'relative w-full rounded-2xl border border-white/5 bg-zinc-950/60 backdrop-blur-xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.45)]';

const AdSlot: React.FC<AdSlotProps> = ({
  slotKey,
  className,
  refreshInterval,
  autoLoad = true,
}) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const containerId = `ad-slot-${slotKey}-${Date.now()}`;
  const containerIdRef = useRef(containerId);
  
  const zoneId = AD_SLOT_ZONE_MAP[slotKey] ?? PRIMARY_AD_ZONE;
  const zoneConfig = AD_ZONE_CONFIG[zoneId];
  const minHeight = AD_SLOT_MIN_HEIGHTS[slotKey] ?? '90px';

  // Defensive check: Never render ads on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  const effectiveRefreshInterval = refreshInterval ?? AD_SLOT_REFRESH_MAP[slotKey] ?? DEFAULT_SLOT_REFRESH_INTERVAL;

  // Refresh slot using the correct method based on zone type
  const refreshSlot = useCallback(() => {
    if (typeof window === 'undefined' || !zoneId || !containerRef.current) {
      return false;
    }

    if (!window.aclib) {
      console.warn(`[AdSlot] aclib not available for ${slotKey}`);
      return false;
    }

    try {
      // Determine the correct method based on zone configuration
      const isBannerZone = zoneConfig?.type === 'banner';
      
      if (isBannerZone && typeof window.aclib.runBanner === 'function') {
        // For banner zones, use runBanner with container ID
        // Set the container ID so AdCash can target it
        containerRef.current.id = containerIdRef.current;
        
        window.aclib.runBanner({
          zoneId,
          containerId: containerIdRef.current
        });
        console.log(`[AdSlot] runBanner ${slotKey} → zone ${zoneId} → container ${containerIdRef.current}`);
      } else if (typeof window.aclib.runAutoTag === 'function') {
        // For autotag zones, use runAutoTag
        // AutoTag looks for elements with data-zone-id attribute
        window.aclib.runAutoTag({ zoneId });
        console.log(`[AdSlot] runAutoTag ${slotKey} → zone ${zoneId}`);
      }
      
      setAdLoaded(true);
      return true;
    } catch (error) {
      console.error(`[AdSlot] Failed to refresh ${slotKey}:`, error);
      return false;
    }
  }, [slotKey, zoneId, zoneConfig]);

  // Set up container attributes on mount
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set attributes for AdCash to find
    containerRef.current.setAttribute('data-zone-id', zoneId);
    containerRef.current.setAttribute('data-ad-slot', slotKey);
    containerRef.current.id = containerIdRef.current;
    
    // Observe for viewability tracking
    observeAdElement(containerRef.current);
  }, [slotKey, zoneId]);

  // Register with global slot registry
  useEffect(() => {
    const unregister = registerAdSlot({ key: slotKey, refresh: refreshSlot });
    return () => unregister();
  }, [slotKey, refreshSlot]);

  // Initial ad load
  useEffect(() => {
    if (autoLoad) {
      // Small delay to ensure container is in DOM
      const timer = setTimeout(() => {
        refreshSlot();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoLoad, refreshSlot]);

  // Periodic refresh interval
  useEffect(() => {
    if (!effectiveRefreshInterval || typeof window === 'undefined') return;
    
    const intervalId = window.setInterval(() => {
      refreshSlot();
    }, effectiveRefreshInterval);
    
    return () => window.clearInterval(intervalId);
  }, [effectiveRefreshInterval, refreshSlot]);

  const combinedClassName = [baseClassName, className].filter(Boolean).join(' ');

  // CRITICAL FIX: Render EMPTY container for AdCash to inject into
  // The old code had placeholder text that blocked ad injection
  return (
    <div
      ref={containerRef}
      id={containerIdRef.current}
      className={combinedClassName}
      style={{ minHeight }}
      data-zone-id={zoneId}
      data-ad-slot={slotKey}
      aria-label={`Advertisement ${slotKey}`}
    >
      {/*
        EMPTY CONTAINER - AdCash will inject ad content here
        Do NOT add any text or elements - this blocks ad injection!
      */}
    </div>
  );
};

export default AdSlot;
