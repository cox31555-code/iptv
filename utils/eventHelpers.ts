import { SportEvent } from '../types';
import { getFullImageUrl, getEventCoverUrl } from '../api';

export const formatEventTime = (dateStr: string): string => {
  const eventDate = new Date(dateStr);
  const now = new Date();
  
  const isSameDay = 
    eventDate.getDate() === now.getDate() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return eventDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  } else {
    const month = eventDate.toLocaleString('en-US', { month: 'short' });
    const day = eventDate.getDate();
    return `${month} ${day}`;
  }
};

export const getDisplayCoverUrl = (event: SportEvent): string => {
  const manualUrl = event.coverImageUrl?.trim();
  if (manualUrl) {
    const fullUrl = getFullImageUrl(manualUrl);
    if (fullUrl) return fullUrl;
  }
  return getEventCoverUrl(event.id);
};

export const createRequestKey = (url: string, method: string, body?: string, token?: string): string => {
  const bodyHash = body ? btoa(body).slice(0, 8) : '';
  const tokenHash = token ? btoa(token).slice(0, 8) : '';
  return `${method}:${url}:${bodyHash}:${tokenHash}`;
};
