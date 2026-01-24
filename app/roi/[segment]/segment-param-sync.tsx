'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type SegmentKey = 'financial' | 'healthcare' | 'logistics' | 'real-estate';

interface SegmentParamSyncProps {
  segment: SegmentKey;
}

/**
 * Client component that syncs the segment to URL search params.
 * This allows ROICalculatorForm to pick up the segment and apply defaults.
 */
export default function SegmentParamSync({ segment }: SegmentParamSyncProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Map real-estate to realestate for calculator compatibility
    const calcSegment = segment === 'real-estate' ? 'realestate' : segment;

    if (params.get('segment') !== calcSegment) {
      params.set('segment', calcSegment);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [segment, pathname, router]);

  return null;
}
