"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase-browser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Bebas_Neue, Sora } from "next/font/google";

const displayFont = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });
const uiFont = Sora({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className={cn("min-h-screen w-full bg-zinc-950 text-zinc-100", uiFont.className)}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,187,96,0.18),_rgba(0,0,0,0.8)_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.04),_transparent_40%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:18px_18px]" />
        </div>

        <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[1fr_0.95fr]">
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/30 bg-amber-200/10 text-amber-100">
                <span className={cn("text-lg tracking-[0.2em]", displayFont.className)}>IS</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Ink Schedule</p>
                <h1 className={cn("text-4xl text-white", displayFont.className)}>
                  Built for busy tattoo studios.
                </h1>
              </div>
            </div>

            <p className="mt-6 max-w-md text-sm text-zinc-300/90">
              A sharp, modern control room for appointments, artists, and client conversations. Keep the ink
              flowing and the schedule clean.
            </p>

            <div className="mt-10 grid gap-4 text-sm text-zinc-300/80">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                A schedule that respects your time blocks.
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Client messaging that stays organized.
              </div>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Studio insights without the clutter.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border border-white/10 bg-zinc-900/60 shadow-2xl backdrop-blur">
              <CardContent className="space-y-6 p-8">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Welcome back</p>
                  <h2 className={cn("text-4xl text-white tracking-wide", displayFont.className)}>Sign in</h2>
                  <p className="text-xs text-zinc-400">Access your Ink Schedule dashboard.</p>
                </div>

                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      placeholder="you@inkstudio.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-white/15 bg-zinc-950/70 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-white/15 bg-zinc-950/70 text-white placeholder:text-zinc-500"
                    />
                  </div>

                  {error && <p className="text-sm text-rose-300">{error}</p>}

                  <div className="flex items-center justify-between text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        className="h-4 w-4 rounded border-amber-200/60 data-[state=checked]:bg-amber-300 data-[state=checked]:text-zinc-950"
                      />
                      <Label htmlFor="remember" className="text-xs text-zinc-100">
                        Remember me
                      </Label>
                    </div>
                    <Link href="/forgot-password" className="text-amber-200 hover:text-amber-100">
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-300 text-zinc-950 shadow-none hover:bg-amber-200"
                    disabled={!email || !password || isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>

                <p className="text-xs text-zinc-400">
                  Need an account?{" "}
                  <Link href="/signup" className="text-amber-200 hover:text-amber-100">
                    Request access
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
