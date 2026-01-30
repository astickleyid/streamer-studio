/// <reference types="vite/client" />
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  onCLS((metric) => {
    console.log('[Web Vitals] CLS:', metric);
    sendToAnalytics(metric);
  });

  onINP((metric) => {
    console.log('[Web Vitals] INP:', metric);
    sendToAnalytics(metric);
  });

  onFCP((metric) => {
    console.log('[Web Vitals] FCP:', metric);
    sendToAnalytics(metric);
  });

  onLCP((metric) => {
    console.log('[Web Vitals] LCP:', metric);
    sendToAnalytics(metric);
  });

  onTTFB((metric) => {
    console.log('[Web Vitals] TTFB:', metric);
    sendToAnalytics(metric);
  });
}

function sendToAnalytics(metric: any) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });

  // Log to console in development
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log(`[${metric.name}]`, {
      value: metric.value,
      rating: metric.rating
    });
  }

  // Send to analytics endpoint (disabled - no backend endpoint)
  // if (typeof import.meta !== 'undefined' && import.meta.env?.PROD && navigator.sendBeacon) {
  //   navigator.sendBeacon('/api/analytics', body);
  // }
}
