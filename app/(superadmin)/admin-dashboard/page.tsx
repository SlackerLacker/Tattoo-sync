"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Profile = {
  id: string;
  email: string;
  name?: string;
  role: string;
  studio_id: string;
};

export default function AdminDashboardPage() {
  const [studioName, setStudioName] = useState("");
  const [studioDomain, setStudioDomain] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("admin");
  const [studios, setStudios] = useState<any[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        redirect("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "superadmin") {
        redirect("/unauthorized");
        return;
      }

      setAuthorized(true);
      await fetchStudios();
      await fetchUsers();
      setIsLoading(false);
    };

    init();
  }, []);

  const fetchStudios = async () => {
    const res = await fetch("/api/admin/studios");
    const data = await res.json();
    setStudios(data.studios || []);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  };

  const handleCreateStudio = async () => {
    const res = await fetch("/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studioName,
        studioDomain,
        userEmail,
        userPassword,
        userRole,
      }),
    });

    if (res.ok) {
      setStudioName("");
      setStudioDomain("");
      setUserEmail("");
      setUserPassword("");
      await fetchStudios();
      await fetchUsers();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to create studio/user");
    }
  };

  const handleDeleteStudio = async (studioId: string) => {
    const res = await fetch("/api/admin/studios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studioId }),
    });

    if (res.ok) {
      await fetchStudios();
      await fetchUsers();
    } else {
      alert("Failed to delete studio");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">Loading superadmin dashboard...</div>
    );
  }

  if (!authorized) {
    return null; // This won't be hit due to redirect, but safe fallback
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Superadmin Dashboard</h1>

      <div className="space-y-4">
        {/* Create Studio + User */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Create New Studio + User
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Studio Name</Label>
              <Input
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
              />
            </div>
            <div>
              <Label>Studio Domain</Label>
              <Input
                value={studioDomain}
                onChange={(e) => setStudioDomain(e.target.value)}
              />
            </div>
            <div>
              <Label>User Email</Label>
              <Input
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>User Password</Label>
              <Input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>User Role</Label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="border p-2 rounded-md w-full"
              >
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="artist">Artist</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>
          <Button className="mt-4" onClick={handleCreateStudio}>
            Create Studio and User
          </Button>
        </div>

        {/* Studios */}
        <div>
          <h2 className="text-xl font-semibold mt-8 mb-2">Studios</h2>
          <ul className="space-y-2">
            {studios.map((studio) => (
              <li
                key={studio.id}
                className="flex justify-between items-center border p-3 rounded-md"
              >
                <div>
                  <p className="font-medium">{studio.name}</p>
                  <p className="text-sm text-gray-500">{studio.domain}</p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteStudio(studio.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Users */}
        <div>
          <h2 className="text-xl font-semibold mt-8 mb-2">Users</h2>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="border p-3 rounded-md">
                <p className="font-medium">{user.name || user.email}</p>
                <p className="text-sm text-gray-500">
                  Role: {user.role} | Studio ID: {user.studio_id}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
