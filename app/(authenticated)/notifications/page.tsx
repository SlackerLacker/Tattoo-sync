"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type NotificationItem = {
  id: string
  type: string
  title: string
  body: string | null
  data: any
  created_at: string
  read_at: string | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/notifications?limit=50")
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((item) => (item.id === id ? { ...item, read_at: new Date().toISOString() } : item))
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Updates about new conversations and messages.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
          {!loading && notifications.length === 0 && (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {notifications.map((item) => {
            const isUnread = !item.read_at
            const conversationId = item.data?.conversation_id
            return (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-4 rounded-lg border p-3 ${
                  isUnread ? "bg-purple-50 border-purple-100" : "bg-white"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{item.title}</p>
                    {isUnread && <Badge className="text-[10px]">New</Badge>}
                  </div>
                  {item.body && <p className="text-sm text-muted-foreground mt-1">{item.body}</p>}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {conversationId && (
                    <Link href="/messages">
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  )}
                  {isUnread && (
                    <Button size="sm" variant="ghost" onClick={() => markAsRead(item.id)}>
                      Mark read
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
