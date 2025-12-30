/*
 * Ad Viewability Tracking
 * Tracks when ads enter the viewport and logs impressions
 */

interface ViewableAd {
  id: string;
  zoneId: string;
  viewableTime: number;
}

const viewableAds = new Map<string, ViewableAd>();
const MIN_VIEWABLE_TIME = 1000; // 1 second minimum to count as viewable
let viewabilityObserver: IntersectionObserver | null = null;

const getOrCreateObserver = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  if (viewabilityObserver) {
    return viewabilityObserver;
  }

  viewabilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const adElement = entry.target as HTMLElement;
        const zoneId = adElement.getAttribute('data-zone-id');
        const adId = adElement.id || `ad-${zoneId}-${Date.now()}`;

        if (entry.isIntersecting) {
          if (!adElement.id) adElement.id = adId;
          viewableAds.set(adId, {
            id: adId,
            zoneId: zoneId || 'unknown',
            viewableTime: Date.now(),
          });
        } else {
          const ad = viewableAds.get(adId);
          if (ad && Date.now() - ad.viewableTime >= MIN_VIEWABLE_TIME) {
            logViewableImpression(ad);
          }
          viewableAds.delete(adId);
        }
      });
    },
    {
      threshold: 0.5,
      rootMargin: '0px',
    }
  );

  return viewabilityObserver;
};

export const initViewabilityTracking = () => {
  const observer = getOrCreateObserver();
  if (!observer) return null;

  const adContainers = document.querySelectorAll('[data-zone-id]');
  adContainers.forEach((container) => observer.observe(container));
  return observer;
};

export const observeAdElement = (element?: Element | null) => {
  if (!element) return;
  const observer = viewabilityObserver ?? getOrCreateObserver();
  observer?.observe(element);
};

export const disconnectViewabilityTracking = () => {
  viewabilityObserver?.disconnect();
  viewabilityObserver = null;
  viewableAds.clear();
};

const logViewableImpression = (ad: ViewableAd) => {
  const viewDuration = Date.now() - ad.viewableTime;
  console.log(`[AdViewability] Zone ${ad.zoneId} viewable for ${viewDuration}ms`);
};

export const trackAdRefresh = (zoneId: string) => {
  const refreshId = `refresh-${zoneId}-${Date.now()}`;
  console.log(`[AdRefresh] Refreshing zone ${zoneId}`);
  return refreshId;
};
