// app/(superadmin)/admin-dashboard/studio/[studioId]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
interface User {
  id: string;
  full_name: string | null;
  role: string;
}

export default function StudioEditPage() {
  const { studioId } = useParams<{ studioId: string }>();
  const [studio, setStudio] = useState<{ name: string} | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/admin/studios/${studioId}`);
      if (res.ok) {
        const { studio, users } = await res.json();
        setStudio(studio);
        setUsers(users);
      }
      setLoading(false);
    };
    fetchData();
  }, [studioId]);

  const handleUpdateStudio = async () => {
    if (!studio) return;
    const res = await fetch(`/api/admin/studios/${studioId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studioName: studio.name}),
    });
    // handle response…
  };

  // Update a user’s role
  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      // update local state on success
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } else {
      // handle error
    }
  };

  // Remove/disassociate a user from this studio
  const handleRemoveUser = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      // handle error
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Studio</h1>
      {studio && (
        <>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={studio.name}
                onChange={(e) =>
                  setStudio((prev) => prev && { ...prev, name: e.target.value })
                }
              />
            </div>
            <Button onClick={handleUpdateStudio}>Save</Button>
          </div>

          <h2 className="text-xl font-semibold mt-8">Users</h2>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="border p-3 rounded-md flex justify-between items-center">
                <div>
                  <p>{user.full_name}</p> 
                  <p>Role: {user.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="border p-1 rounded-md"
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="artist">Artist</option>
                    <option value="client">Client</option>
                  </select>
                    {/* Optionally disable removing superadmins */}
                  <Button variant="destructive" onClick={() => handleRemoveUser(user.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
