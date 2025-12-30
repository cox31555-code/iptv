type AdSlotHandle = {
  key: string;
  refresh: () => boolean;
};

const adSlotHandles = new Set<AdSlotHandle>();

export const registerAdSlot = (handle: AdSlotHandle) => {
  adSlotHandles.add(handle);
  return () => adSlotHandles.delete(handle);
};

export const refreshRegisteredSlots = () => {
  let ranAtLeastOne = false;
  adSlotHandles.forEach((handle) => {
    try {
      const result = handle.refresh();
      ranAtLeastOne = ranAtLeastOne || result;
    } catch (error) {
      console.error(`[AdSlotRegistry] Slot ${handle.key} refresh failed`, error);
    }
  });
  return ranAtLeastOne;
};

export const getRegisteredSlotKeys = () => Array.from(adSlotHandles).map((handle) => handle.key);
