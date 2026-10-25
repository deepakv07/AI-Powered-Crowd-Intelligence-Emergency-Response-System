import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 max-w-5xl">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <span className="font-semibold text-amber-950">Demonstration Prototype:</span>
        <span className="text-amber-800">
          Demonstration prototype using simulated data. Not connected to official Kumbh Mela operations. Risk scores, routes and alerts are illustrative and must not be used for real-world emergency decisions.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-amber-900 shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
        <span>Decision-Support Simulation v1.4</span>
      </div>
    </div>
  );
};
