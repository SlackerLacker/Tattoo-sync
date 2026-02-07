"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bebas_Neue, Sora } from "next/font/google";

const displayFont = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });
const uiFont = Sora({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function RequestAccessPage() {
  const [name, setName] = useState("");
  const [studio, setStudio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("I'm interested in Ink Schedule.");

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("Ink Schedule access request");
    const body = encodeURIComponent(
      `I'm interested in Ink Schedule.\n\nName: ${name}\nStudio: ${studio}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`
    );
    return `mailto:fromashesllc@gmail.com?subject=${subject}&body=${body}`;
  }, [name, studio, email, phone, message]);

  return (
    <div className={cn("min-h-screen w-full bg-zinc-950 text-zinc-100", uiFont.className)}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,187,96,0.18),_rgba(0,0,0,0.8)_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.04),_transparent_40%)]" />
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:18px_18px]" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-16">
          <Card className="w-full max-w-lg border border-white/10 bg-zinc-900/60 shadow-2xl backdrop-blur">
            <CardContent className="space-y-6 p-8">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-200/70">Request access</p>
                <h1 className={cn("text-3xl text-white", displayFont.className)}>Ink Schedule</h1>
                <p className="mt-2 text-sm text-zinc-300/80">
                  Send us a quick note and we’ll get you set up.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-white">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="studio" className="text-white">Studio name</Label>
                  <Input
                    id="studio"
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                    placeholder="Your studio"
                    className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@inkstudio.com"
                    type="email"
                    className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-white">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message" className="text-white">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="border-white/10 bg-zinc-950/60 text-white placeholder:text-zinc-500"
                    rows={4}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-amber-300 text-zinc-950 shadow-none hover:bg-amber-200"
                asChild
              >
                <a href={mailtoHref}>Send request</a>
              </Button>

              <div className="text-xs text-zinc-400">
                Already have access?{" "}
                <Link href="/login" className="text-amber-200 hover:text-amber-100">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
