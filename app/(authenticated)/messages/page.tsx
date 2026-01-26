"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Search,
  Plus,
  Star,
  Archive,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatInterface from "@/components/chat/ChatInterface"
import { supabase } from "@/lib/supabase-browser"

interface Conversation {
  id: string
  type: "client" | "group" | "staff"
  name: string
  participants: any[]
  last_message: {
    content: string
    created_at: string
  }
  unread_count: number
  is_starred: boolean
  is_archived: boolean
  updated_at: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [newConversationData, setNewConversationData] = useState<{
    participants: string[]
  }>({ participants: [] })

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        fetchConversations()
        fetchClients()
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

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients")
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
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
        // Select the new conversation (needs full enriched object, so simplified here by refetch)
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
      return conv.participants[0].full_name || "Unknown User"
    }
    return "Chat"
  }

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv)
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())

    switch (activeTab) {
      case "unread":
        return matchesSearch && conv.unread_count > 0
      default:
        return matchesSearch
    }
  })

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Communicate with clients and team members</p>
        </div>
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
              <DialogDescription>Create a new conversation with clients or team members.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="conversation-type">Conversation Type</Label>
                <Select
                  value={newConversationData.type}
                  onValueChange={(value) =>
                    setNewConversationData({
                      ...newConversationData,
                      type: value as "client" | "staff" | "group",
                      participants: [],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="staff">Staff Member</SelectItem>
                    <SelectItem value="group">Group Chat</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newConversationData.type === "group" && (
                <div className="grid gap-2">
                  <Label htmlFor="group-name">Group Name</Label>
                  <Input
                    id="group-name"
                    placeholder="Enter group name"
                    value={newConversationData.name || ""}
                    onChange={(e) => setNewConversationData({ ...newConversationData, name: e.target.value })}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="participants">
                  {newConversationData.type === "client"
                    ? "Select Client"
                    : newConversationData.type === "staff"
                      ? "Select Staff Member"
                      : "Select Participants"}
                </Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (!newConversationData.participants.includes(value)) {
                      setNewConversationData({
                        ...newConversationData,
                        participants:
                          newConversationData.type === "group" ? [...newConversationData.participants, value] : [value],
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${newConversationData.type}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {newConversationData.type === "client" && clients.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {newConversationData.participants.length > 0 && (
                <div className="grid gap-2">
                  <Label>Selected Participants</Label>
                  <div className="flex flex-wrap gap-2">
                    {newConversationData.participants.map((participant, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {participant}
                        <button
                          onClick={() =>
                            setNewConversationData({
                              ...newConversationData,
                              participants: newConversationData.participants.filter((p) => p !== participant),
                            })
                          }
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Communicate with clients and team members</p>
        </div>
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
              <DialogDescription>Create a new conversation with clients or team members.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="participants">Select Client</Label>
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
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 px-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Conversations</span>
            </div>
            <p className="text-2xl font-bold mt-2">{conversations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-medium">Unread</span>
            </div>
            <p className="text-2xl font-bold mt-2">{conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 px-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-300px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Conversations</CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    Unread
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-1 p-4">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={conversation.participants?.[0]?.avatar_url || "/placeholder.svg"}
                          />
                          <AvatarFallback className="text-xs">
                            {getConversationName(conversation)
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="font-medium text-sm truncate">{getConversationName(conversation)}</h4>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.updated_at)}
                            </span>
                            {conversation.unread_count > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 w-5 p-0 text-xs flex items-center justify-center"
                              >
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 overflow-hidden truncate">
                          {conversation.last_message?.content || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col h-full">
            {selectedConversation ? (
              <ChatInterface
                conversationId={selectedConversation.id}
                currentUserId={currentUserId}
                recipientName={getConversationName(selectedConversation)}
                recipientAvatar={selectedConversation.participants?.[0]?.avatar_url}
              />
            ) : (
              <CardContent className="p-12 text-center flex-1 flex items-center justify-center">
                <div className="text-gray-500">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging.</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
