"use client";

import {
  Calendar,
  Users,
  MessageSquare,
  Package,
  Settings,
  Palette,
  BarChart3,
  Home,
  Share2,
  DollarSign,
  X,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar,
  },
  {
    title: "Artists",
    url: "/artists",
    icon: Palette,
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Users,
  },
  {
    title: "Messages",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Services & Products",
    url: "/services",
    icon: Package,
  },
  {
    title: "Financials",
    url: "/financials",
    icon: DollarSign,
  },
  {
    title: "Social",
    url: "/social",
    icon: Share2,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

type AppSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "NA";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return (parts[0][0] || "N").toUpperCase();
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) return;
      setUserId(session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", session.user.id)
        .single();

      if (!profileError && profile?.full_name) {
        setFullName(profile.full_name);
      }
      if (!profileError) {
        setAvatarUrl(profile?.avatar_url || null);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    let channel: any;

    const fetchNotificationCount = async () => {
      try {
        const res = await fetch("/api/notifications?count=true");
        if (!res.ok) return;
        const data = await res.json();
        setNotificationCount(data.count || 0);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();

    channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchNotificationCount();
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
              <Palette className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">InkSync</h2>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onClose}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Navigation
          </p>
          {navigationItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="size-4" />
                <span className="flex-1">{item.title}</span>
                {item.title === "Notifications" && notificationCount > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5">
                    {notificationCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} />
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fullName || "Loading..."}
            </p>
            <p className="text-xs text-gray-500 truncate">Shop Owner</p>
          </div>
        </div>
        <div className="flex mt-2">
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
