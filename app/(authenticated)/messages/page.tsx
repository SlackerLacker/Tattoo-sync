"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  Star,
  Archive,
  Trash2,
  ImageIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: number
  conversationId: number
  senderId: number
  senderName: string
  senderType: "client" | "staff"
  content: string
  timestamp: string
  status: "sent" | "delivered" | "read"
  attachments?: { type: string; url: string; name: string }[]
}

interface Conversation {
  id: number
  type: "client" | "group" | "staff"
  name: string
  participants: string[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isStarred: boolean
  isArchived: boolean
  avatar?: string
  isOnline?: boolean
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    type: "client",
    name: "Sarah Johnson",
    participants: ["Sarah Johnson", "Mike Rodriguez"],
    lastMessage: "Thanks for the consultation! When can we schedule the next session?",
    lastMessageTime: "2024-01-20T14:30:00",
    unreadCount: 2,
    isStarred: false,
    isArchived: false,
    isOnline: true,
  },
  {
    id: 2,
    type: "client",
    name: "David Chen",
    participants: ["David Chen", "Luna Martinez"],
    lastMessage: "The tattoo is healing perfectly! Thank you so much.",
    lastMessageTime: "2024-01-20T10:15:00",
    unreadCount: 0,
    isStarred: true,
    isArchived: false,
    isOnline: false,
  },
  {
    id: 3,
    type: "group",
    name: "Shop Team",
    participants: ["Mike Rodriguez", "Luna Martinez", "Jake Thompson", "Sarah Kim"],
    lastMessage: "Mike: Don't forget about the team meeting tomorrow at 2 PM",
    lastMessageTime: "2024-01-20T09:45:00",
    unreadCount: 1,
    isStarred: false,
    isArchived: false,
    isOnline: true,
  },
  {
    id: 4,
    type: "client",
    name: "Emma Wilson",
    participants: ["Emma Wilson", "Jake Thompson"],
    lastMessage: "I'm really nervous about the cover-up. Can we discuss the design more?",
    lastMessageTime: "2024-01-19T16:20:00",
    unreadCount: 3,
    isStarred: false,
    isArchived: false,
    isOnline: false,
  },
  {
    id: 5,
    type: "staff",
    name: "Luna Martinez",
    participants: ["Luna Martinez", "Mike Rodriguez"],
    lastMessage: "Can you help me with the new client consultation tomorrow?",
    lastMessageTime: "2024-01-19T14:10:00",
    unreadCount: 0,
    isStarred: false,
    isArchived: false,
    isOnline: true,
  },
]

const initialMessages: Message[] = [
  {
    id: 1,
    conversationId: 1,
    senderId: 1,
    senderName: "Sarah Johnson",
    senderType: "client",
    content: "Hi Mike! I wanted to follow up on our consultation yesterday.",
    timestamp: "2024-01-20T13:15:00",
    status: "read",
  },
  {
    id: 2,
    conversationId: 1,
    senderId: 2,
    senderName: "Mike Rodriguez",
    senderType: "staff",
    content: "Hey Sarah! Great to hear from you. I'm excited to work on your sleeve design.",
    timestamp: "2024-01-20T13:20:00",
    status: "read",
  },
  {
    id: 3,
    conversationId: 1,
    senderId: 1,
    senderName: "Sarah Johnson",
    senderType: "client",
    content: "Thanks for the consultation! When can we schedule the next session?",
    timestamp: "2024-01-20T14:30:00",
    status: "delivered",
  },
  {
    id: 4,
    conversationId: 2,
    senderId: 3,
    senderName: "David Chen",
    senderType: "client",
    content: "The tattoo is healing perfectly! Thank you so much.",
    timestamp: "2024-01-20T10:15:00",
    status: "read",
  },
  {
    id: 5,
    conversationId: 3,
    senderId: 2,
    senderName: "Mike Rodriguez",
    senderType: "staff",
    content: "Don't forget about the team meeting tomorrow at 2 PM",
    timestamp: "2024-01-20T09:45:00",
    status: "delivered",
  },
]

const clients = [
  { id: 1, name: "Sarah Johnson", phone: "(555) 123-4567" },
  { id: 2, name: "David Chen", phone: "(555) 234-5678" },
  { id: 3, name: "Emma Wilson", phone: "(555) 345-6789" },
  { id: 4, name: "Alex Rivera", phone: "(555) 456-7890" },
]

const staff = [
  { id: 1, name: "Mike Rodriguez", role: "Artist" },
  { id: 2, name: "Luna Martinez", role: "Artist" },
  { id: 3, name: "Jake Thompson", role: "Artist" },
  { id: 4, name: "Sarah Kim", role: "Artist" },
]

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newConversationData, setNewConversationData] = useState<{
    type: "client" | "staff" | "group"
    participants: string[]
    name?: string
  }>({ type: "client", participants: [] })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.id, messages])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1 && selectedConversation) {
        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 2000)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedConversation])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const getConversationMessages = (conversationId: number) => {
    return messages
      .filter((msg) => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())

    switch (activeTab) {
      case "unread":
        return matchesSearch && conv.unreadCount > 0
      case "starred":
        return matchesSearch && conv.isStarred
      case "archived":
        return matchesSearch && conv.isArchived
      default:
        return matchesSearch && !conv.isArchived
    }
  })

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Math.max(...messages.map((m) => m.id)) + 1,
      conversationId: selectedConversation.id,
      senderId: 999, // Current user ID
      senderName: "You",
      senderType: "staff",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
    }

    setMessages([...messages, message])

    // Update conversation last message
    setConversations(
      conversations.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: newMessage.trim(), lastMessageTime: new Date().toISOString() }
          : conv,
      ),
    )

    setNewMessage("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !selectedConversation) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const attachment = {
          type: file.type.startsWith("image/") ? "image" : "file",
          url: e.target?.result as string,
          name: file.name,
        }

        const message: Message = {
          id: Math.max(...messages.map((m) => m.id)) + 1,
          conversationId: selectedConversation.id,
          senderId: 999,
          senderName: "You",
          senderType: "staff",
          content: `Shared ${file.type.startsWith("image/") ? "an image" : "a file"}: ${file.name}`,
          timestamp: new Date().toISOString(),
          status: "sent",
          attachments: [attachment],
        }

        setMessages((prev) => [...prev, message])
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const toggleStar = (conversationId: number) => {
    setConversations(
      conversations.map((conv) => (conv.id === conversationId ? { ...conv, isStarred: !conv.isStarred } : conv)),
    )
  }

  const archiveConversation = (conversationId: number) => {
    setConversations(conversations.map((conv) => (conv.id === conversationId ? { ...conv, isArchived: true } : conv)))
  }

  const markAsRead = (conversationId: number) => {
    setConversations(conversations.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)))
  }

  const createNewConversation = () => {
    if (newConversationData.participants.length === 0) return

    const newConv: Conversation = {
      id: Math.max(...conversations.map((c) => c.id)) + 1,
      type: newConversationData.type,
      name: newConversationData.name || newConversationData.participants[0],
      participants: newConversationData.participants,
      lastMessage: "Conversation started",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      isStarred: false,
      isArchived: false,
    }

    setConversations([newConv, ...conversations])
    setSelectedConversation(newConv)
    setIsNewConversationOpen(false)
    setNewConversationData({ type: "client", participants: [] })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const getConversationIcon = (type: string) => {
    switch (type) {
      case "group":
        return "👥"
      case "staff":
        return "👨‍💼"
      default:
        return "👤"
    }
  }

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
                    {(newConversationData.type === "client" ? clients : staff).map((person) => (
                      <SelectItem key={person.id} value={person.name}>
                        {person.name} {newConversationData.type === "staff" && `(${(person as any).role})`}
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 px-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Conversations</span>
            </div>
            <p className="text-2xl font-bold mt-2">{conversations.filter((c) => !c.isArchived).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-medium">Unread</span>
            </div>
            <p className="text-2xl font-bold mt-2">{conversations.reduce((sum, c) => sum + c.unreadCount, 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Starred</span>
            </div>
            <p className="text-2xl font-bold mt-2">{conversations.filter((c) => c.isStarred).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Archived</span>
            </div>
            <p className="text-2xl font-bold mt-2">{conversations.filter((c) => c.isArchived).length}</p>
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    Unread
                  </TabsTrigger>
                  <TabsTrigger value="starred" className="text-xs">
                    Starred
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="text-xs">
                    Archived
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
                      onClick={() => {
                        setSelectedConversation(conversation)
                        if (conversation.unreadCount > 0) {
                          markAsRead(conversation.id)
                        }
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${conversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}`}
                          />
                          <AvatarFallback className="text-xs">
                            {conversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 text-xs">{getConversationIcon(conversation.type)}</div>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <h4 className="font-medium text-sm truncate">{conversation.name}</h4>
                            {conversation.isStarred && (
                              <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 w-5 p-0 text-xs flex items-center justify-center"
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 overflow-hidden">
                          {conversation.lastMessage.length > 45
                            ? `${conversation.lastMessage.substring(0, 45)}...`
                            : conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${selectedConversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}`}
                          />
                          <AvatarFallback>
                            {selectedConversation.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.type === "group"
                            ? `${selectedConversation.participants.length} participants`
                            : selectedConversation.type === "client"
                              ? "Client"
                              : "Staff Member"}
                          {selectedConversation.isOnline && <span className="ml-2 text-green-600">• Online</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleStar(selectedConversation.id)}>
                            <Star className="mr-2 h-4 w-4" />
                            {selectedConversation.isStarred ? "Unstar" : "Star"} Conversation
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => archiveConversation(selectedConversation.id)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive Conversation
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {getConversationMessages(selectedConversation.id).map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderName === "You" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderName === "You" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            {message.senderName !== "You" && selectedConversation.type === "group" && (
                              <p className="text-xs font-medium mb-1 opacity-75">{message.senderName}</p>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.attachments && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="bg-white/20 rounded p-2">
                                    {attachment.type === "image" ? (
                                      <img
                                        src={attachment.url || "/placeholder.svg"}
                                        alt={attachment.name}
                                        className="max-w-full h-auto rounded cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(attachment.url, "_blank")}
                                      />
                                    ) : (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Paperclip className="h-4 w-4" />
                                        <span>{attachment.name}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs opacity-75">{formatTime(message.timestamp)}</span>
                              {message.senderName === "You" && (
                                <div className="ml-2">{getStatusIcon(message.status)}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[70%]">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4 flex-shrink-0">
                    <div className="flex items-end gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept="image/*,.pdf,.doc,.docx"
                        className="hidden"
                      />
                      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 relative">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                          className="min-h-[40px] max-h-[120px] resize-none pr-12"
                          rows={1}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
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
