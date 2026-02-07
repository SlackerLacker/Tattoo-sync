"use client";

import { useState } from "react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email || isSubmitting) return;
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const redirectTo =
      process.env.NEXT_PUBLIC_RESET_PASSWORD_REDIRECT ||
      `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

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
                <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Reset access</p>
                <h1 className={cn("text-3xl text-white", displayFont.className)}>Forgot your password?</h1>
                <p className="mt-2 text-sm text-zinc-300/80">
                  Enter your email and we’ll send a secure link to set a new password.
                </p>
              </div>

              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReset();
                }}
              >
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  placeholder="you@inkstudio.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                />
                <Button
                  type="submit"
                  className="w-full bg-amber-300 text-zinc-950 hover:bg-amber-200"
                  disabled={!email || isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </Button>
              </form>

              {error && <p className="text-sm text-rose-300">{error}</p>}
              {success && (
                <p className="text-sm text-amber-200">
                  Check your inbox (and spam) for a secure link to reset your password.
                </p>
              )}

              <div className="text-xs text-zinc-400">
                Remembered it?{" "}
                <Link href="/login" className="text-amber-200 hover:text-amber-100">
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
