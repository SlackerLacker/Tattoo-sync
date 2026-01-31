"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Search,
  Star,
  MessageSquare,
  Plus
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import ChatInterface from "@/components/chat/ChatInterface"
import { supabase } from "@/lib/supabase-browser"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Conversation {
  id: string
  participants: any[]
  last_message: {
    content: string
    created_at: string
    attachments?: any[]
  }
  unread_count: number
  updated_at: string
}

export default function ClientMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [artists, setArtists] = useState<any[]>([])
  const [newConversationData, setNewConversationData] = useState<{
    participants: string[]
  }>({ participants: [] })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        fetchConversations()
        fetchArtists()
      }
    }
    init()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0])
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchArtists = async () => {
    try {
      const res = await fetch("/api/artists")
      if (res.ok) {
        const data = await res.json()
        setArtists(data)
      }
    } catch (error) {
      console.error("Error fetching artists:", error)
    }
  }

  const createNewConversation = async () => {
    if (newConversationData.participants.length === 0) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get studio ID from profile (simplified)
      const { data: profile } = await supabase.from('profiles').select('studio_id').eq('id', user.id).single()

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant_ids: newConversationData.participants,
          studio_id: profile?.studio_id
        })
      })

      if (res.ok) {
        const newConv = await res.json()
        await fetchConversations()
        setIsNewConversationOpen(false)
        setNewConversationData({ participants: [] })
      }
    } catch (error) {
      console.error("Error creating conversation:", error)
    }
  }

  const formatTime = (timestamp: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getConversationName = (conv: Conversation) => {
    if (conv.participants && conv.participants.length > 0) {
      return conv.participants[0].full_name || "Unknown Artist"
    }
    return "Chat"
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      getConversationName(conv).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/client" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <div></div>
          <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Start New Conversation</DialogTitle>
                <DialogDescription>Start a chat with an artist.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="participants">Select Artist</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!newConversationData.participants.includes(value)) {
                        setNewConversationData({
                          participants: [value],
                        })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Artist" />
                    </SelectTrigger>
                    <SelectContent>
                      {artists.map((artist) => (
                        <SelectItem key={artist.id} value={artist.id}>
                          {artist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewConversationOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createNewConversation} disabled={newConversationData.participants.length === 0}>
                  Start Conversation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Your Artists</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[550px]">
                <div className="space-y-1 p-4">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? "bg-purple-50 border-l-4 border-purple-500" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.participants?.[0]?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {getConversationName(conversation)
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unread_count > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                          >
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{getConversationName(conversation)}</h4>
                          <span className="text-xs text-gray-500">{formatTime(conversation.updated_at)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-gray-500">Artist</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.last_message?.content || (conversation.last_message?.attachments && conversation.last_message.attachments.length > 0 ? "Attachment sent" : "No messages yet")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 h-full flex flex-col">
            {selectedConversation ? (
              <ChatInterface
                conversationId={selectedConversation.id}
                currentUserId={currentUserId}
                recipientName={getConversationName(selectedConversation)}
                recipientAvatar={selectedConversation.participants?.[0]?.avatar_url}
              />
            ) : (
              <CardContent className="p-12 text-center h-full flex items-center justify-center">
                <div className="text-gray-500">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p>Choose an artist from the list to start messaging.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
