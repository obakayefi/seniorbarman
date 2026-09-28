"use client";

import React, { useState } from "react";
import { UserCheck, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImpersonationBannerProps {
  userEmail: string;
}

export function ImpersonationBanner({ userEmail }: ImpersonationBannerProps) {
  const [stopping, setStopping] = useState(false);

  const handleStop = async () => {
    setStopping(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Exited impersonation mode");
        window.location.href = "/u/a/accounts";
      } else {
        toast.error(data.error || "Failed to exit impersonation");
        setStopping(false);
      }
    } catch (err) {
      toast.error("Error exiting impersonation");
      setStopping(false);
    }
  };

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 flex items-center justify-between font-medium text-xs sm:text-sm shadow-md border-b border-amber-600 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <UserCheck className="h-4 w-4 shrink-0 font-bold" />
        <span>
          <strong>Impersonation Active:</strong> Viewing app as <u>{userEmail}</u>
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleStop}
        disabled={stopping}
        className="h-7 text-xs bg-slate-950 text-amber-400 hover:bg-slate-900 border-none shrink-0"
      >
        {stopping ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <LogOut className="h-3 w-3 mr-1" />}
        Stop Impersonating
      </Button>
    </div>
  );
}
