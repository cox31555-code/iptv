/**
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

export const initViewabilityTracking = () => {
  const observer = new IntersectionObserver((entries) => {
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
  }, {
    threshold: 0.5,
    rootMargin: '0px',
  });

  // Observe all ad containers
  const adContainers = document.querySelectorAll('[data-zone-id]');
  adContainers.forEach((container) => observer.observe(container));

  return observer;
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
