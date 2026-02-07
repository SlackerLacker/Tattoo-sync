"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Bebas_Neue, Sora } from "next/font/google";

const displayFont = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });
const uiFont = Sora({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setHasSession(!!data.session);
    };
    checkSession();
  }, []);

  const handleReset = async () => {
    if (isSubmitting) return;
    setError("");
    setSuccess(false);

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);
  };

  return (
    <div className={cn("min-h-screen w-full bg-zinc-950 text-zinc-100", uiFont.className)}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,187,96,0.18),_rgba(0,0,0,0.8)_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.04),_transparent_40%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:18px_18px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
          <Card className="w-full max-w-md border border-white/10 bg-white/5 shadow-2xl backdrop-blur">
            <CardContent className="space-y-6 p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Set a new password</p>
                <h1 className={cn("text-3xl text-white", displayFont.className)}>Reset your password</h1>
                <p className="mt-2 text-sm text-zinc-300/80">
                  Choose a strong password to secure your account.
                </p>
              </div>

              {!hasSession && (
                <p className="text-sm text-rose-300">
                  This reset link is invalid or expired. Please request a new one.
                </p>
              )}

              <div className="space-y-3">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  placeholder="••••••••"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                />
              </div>

              {error && <p className="text-sm text-rose-300">{error}</p>}
              {success && (
                <p className="text-sm text-amber-200">
                  Password updated. You can sign in now.
                </p>
              )}

              <Button
                onClick={handleReset}
                className="w-full bg-amber-300 text-zinc-950 hover:bg-amber-200"
                disabled={!hasSession || isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </Button>

              <div className="text-xs text-zinc-400">
                Back to{" "}
                <Link href="/login" className="text-amber-200 hover:text-amber-100">
                  sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
