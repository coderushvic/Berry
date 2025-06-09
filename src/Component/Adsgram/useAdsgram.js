import { useCallback, useEffect, useRef } from 'react';

export function useAdsgram({ blockId, onReward, onError }) {
  const AdControllerRef = useRef();

  useEffect(() => {
    AdControllerRef.current = window.Adsgram?.init({ blockId });
  }, [blockId]);

  return useCallback(async () => {
    if (AdControllerRef.current) {
      AdControllerRef.current
        .show()
        .then(() => {
          // User watched the ad till the end
          onReward();
        })
        .catch((result) => {
          // User encountered an error or skipped the ad
          onError?.(result);
        });
    } else {
      onError?.({
        error: true,
        done: false,
        state: 'load',
        description: 'AdsGram script not loaded',
      });
    }
  }, [onError, onReward]);
}