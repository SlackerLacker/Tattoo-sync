"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea, Input } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Send,
  Paperclip,
  ImageIcon,
  Smile,
  Phone,
  Video,
  MoreHorizontal,
  Star,
  Check,
  CheckCheck,
  Clock,
  Search,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

interface Message {
  id: number
  senderId: number
  senderName: string
  senderType: "client" | "artist"
  content: string
  timestamp: string
  status: "sending" | "sent" | "delivered" | "read"
  attachments?: { type: string; url: string; name: string }[]
}

interface Conversation {
  id: number
  artistId: number
  artistName: string
  artistSpecialty: string
  artistAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  messages: Message[]
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    artistId: 1,
    artistName: "Mike Rodriguez",
    artistSpecialty: "Traditional",
    artistAvatar: "/placeholder.svg?height=48&width=48&text=MR",
    lastMessage: "Looking forward to our session tomorrow! The design looks perfect.",
    lastMessageTime: "2024-01-22T16:30:00",
    unreadCount: 1,
    isOnline: true,
    messages: [
      {
        id: 1,
        senderId: 1,
        senderName: "You",
        senderType: "client",
        content:
          "Hi Mike! I'm really excited about the traditional rose tattoo we discussed. I've been thinking about the placement and I think my forearm would be perfect.",
        timestamp: "2024-01-22T14:15:00",
        status: "read",
      },
      {
        id: 2,
        senderId: 2,
        senderName: "Mike Rodriguez",
        senderType: "artist",
        content:
          "Hey! That sounds great! The forearm is an excellent choice for a traditional rose. It'll give us plenty of space to work with bold lines and vibrant colors. Do you have any color preferences?",
        timestamp: "2024-01-22T14:20:00",
        status: "read",
      },
      {
        id: 3,
        senderId: 1,
        senderName: "You",
        senderType: "client",
        content:
          "I was thinking classic red for the rose with green leaves, maybe some yellow highlights? I love the traditional bold look.",
        timestamp: "2024-01-22T14:25:00",
        status: "read",
      },
      {
        id: 4,
        senderId: 2,
        senderName: "Mike Rodriguez",
        senderType: "artist",
        content:
          "Perfect choice! Classic red roses are my favorite to do. I'll prepare the stencil with those colors in mind. Here's a quick sketch of what I'm thinking.",
        timestamp: "2024-01-22T15:45:00",
        status: "read",
        attachments: [
          { type: "image", url: "/placeholder.svg?height=200&width=200&text=Rose+Sketch", name: "rose_sketch.jpg" },
        ],
      },
      {
        id: 5,
        senderId: 1,
        senderName: "You",
        senderType: "client",
        content: "Oh wow, that looks amazing! I love the detail in the petals. This is exactly what I had in mind!",
        timestamp: "2024-01-22T16:00:00",
        status: "read",
      },
      {
        id: 6,
        senderId: 2,
        senderName: "Mike Rodriguez",
        senderType: "artist",
        content:
          "Looking forward to our session tomorrow! The design looks perfect. Make sure to eat a good meal before coming in and get plenty of rest tonight.",
        timestamp: "2024-01-22T16:30:00",
        status: "delivered",
      },
    ],
  },
  {
    id: 2,
    artistId: 2,
    artistName: "Luna Martinez",
    artistSpecialty: "Fine Line",
    artistAvatar: "/placeholder.svg?height=48&width=48&text=LM",
    lastMessage: "Thanks for the reference images! I have some ideas for the moon phases design.",
    lastMessageTime: "2024-01-21T11:20:00",
    unreadCount: 0,
    isOnline: false,
    messages: [
      {
        id: 7,
        senderId: 1,
        senderName: "You",
        senderType: "client",
        content:
          "Hi Luna! I'm interested in getting a small moon phases tattoo behind my ear. I love your fine line work!",
        timestamp: "2024-01-21T10:30:00",
        status: "read",
      },
      {
        id: 8,
        senderId: 3,
        senderName: "Luna Martinez",
        senderType: "artist",
        content:
          "Hi there! Thank you so much! I'd love to work on a moon phases piece with you. Behind the ear is a beautiful and delicate placement. Do you have any reference images or specific style in mind?",
        timestamp: "2024-01-21T10:45:00",
        status: "read",
      },
      {
        id: 9,
        senderId: 1,
        senderName: "You",
        senderType: "client",
        content:
          "I've attached some reference images. I love the minimalist style with very thin lines. Nothing too bold or heavy.",
        timestamp: "2024-01-21T11:00:00",
        status: "read",
        attachments: [
          { type: "image", url: "/placeholder.svg?height=150&width=150&text=Moon+Ref+1", name: "moon_ref_1.jpg" },
          { type: "image", url: "/placeholder.svg?height=150&width=150&text=Moon+Ref+2", name: "moon_ref_2.jpg" },
        ],
      },
      {
        id: 10,
        senderId: 3,
        senderName: "Luna Martinez",
        senderType: "artist",
        content:
          "Thanks for the reference images! I have some ideas for the moon phases design. The minimalist approach will look stunning behind your ear. Let's schedule a consultation to discuss the details!",
        timestamp: "2024-01-21T11:20:00",
        status: "read",
      },
    ],
  },
  {
    id: 3,
    artistId: 3,
    artistName: "Jake Thompson",
    artistSpecialty: "Realism",
    artistAvatar: "/placeholder.svg?height=48&width=48&text=JT",
    lastMessage: "I'll need about 6-8 hours total for a piece like this. We can split it into 2-3 sessions.",
    lastMessageTime: "2024-01-20T14:45:00",
    unreadCount: 0,
    isOnline: true,
    messages: [
      {
        id: 11,
        senderId: 1,
        senderName: "You",
        senderType: "client",
        content:
          "Hi Jake! I'm interested in getting a realistic portrait tattoo of my dog who passed away recently. I have some great photos of him.",
        timestamp: "2024-01-20T13:30:00",
        status: "read",
      },
      {
        id: 12,
        senderId: 4,
        senderName: "Jake Thompson",
        senderType: "artist",
        content:
          "I'm so sorry for your loss. I'd be honored to create a memorial piece for your dog. Portrait tattoos are very special to me. Could you share some of those photos? I'll need high-resolution images with good lighting.",
        timestamp: "2024-01-20T13:45:00",
        status: "read",
      },
      {
        id: 13,
        senderId: 1,
        senderName: "You",
        senderType: "client",
        content:
          "Thank you so much. Here are some of my favorite photos of him. The first one really captures his personality.",
        timestamp: "2024-01-20T14:00:00",
        status: "read",
        attachments: [
          { type: "image", url: "/placeholder.svg?height=200&width=200&text=Dog+Photo+1", name: "buddy_1.jpg" },
          { type: "image", url: "/placeholder.svg?height=200&width=200&text=Dog+Photo+2", name: "buddy_2.jpg" },
          { type: "image", url: "/placeholder.svg?height=200&width=200&text=Dog+Photo+3", name: "buddy_3.jpg" },
        ],
      },
      {
        id: 14,
        senderId: 4,
        senderName: "Jake Thompson",
        senderType: "artist",
        content:
          "These are beautiful photos! He looks like he was such a sweet boy. The first photo will work perfectly for the tattoo. Where were you thinking of placing it and what size?",
        timestamp: "2024-01-20T14:30:00",
        status: "read",
      },
      {
        id: 15,
        senderId: 1,
        senderName: "You",
        senderType: "client",
        content:
          "I was thinking on my upper arm, maybe about 6-7 inches tall? I want it to be detailed enough to really capture his features.",
        timestamp: "2024-01-20T14:35:00",
        status: "read",
      },
      {
        id: 16,
        senderId: 4,
        senderName: "Jake Thompson",
        senderType: "artist",
        content:
          "That's a perfect size for the level of detail we'll want. I'll need about 6-8 hours total for a piece like this. We can split it into 2-3 sessions. My rate is $180/hour for realism work.",
        timestamp: "2024-01-20T14:45:00",
        status: "read",
      },
    ],
  },
]

export default function ClientMessages() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  // Simulate real-time message updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate receiving new messages occasionally
      if (Math.random() < 0.1) {
        // 10% chance every 5 seconds
        const randomConv = conversations[Math.floor(Math.random() * conversations.length)]
        if (randomConv && selectedConversation?.id === randomConv.id) {
          // Simulate artist typing
          setIsTyping(true)
          setTimeout(() => {
            setIsTyping(false)
            // Add a new message (in real app, this would come from WebSocket/Server-Sent Events)
          }, 2000)
        }
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [conversations, selectedConversation])

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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now(),
      senderId: 1, // Current user ID
      senderName: "You",
      senderType: "client",
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      status: "sending",
    }

    // Add message to conversation
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage.trim(),
          lastMessageTime: new Date().toISOString(),
        }
      }
      return conv
    })

    setConversations(updatedConversations)
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
      lastMessage: newMessage.trim(),
      lastMessageTime: new Date().toISOString(),
    })

    setNewMessage("")

    // Simulate message status updates
    setTimeout(() => {
      updateMessageStatus(message.id, "sent")
    }, 500)

    setTimeout(() => {
      updateMessageStatus(message.id, "delivered")
    }, 1000)

    // In a real app, you would send this to your backend
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage.trim(),
          recipientId: selectedConversation.artistId,
        }),
      })

      if (response.ok) {
        updateMessageStatus(message.id, "delivered")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      // Handle error - maybe show a retry button
    }
  }

  const updateMessageStatus = (messageId: number, status: Message["status"]) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) => ({
        ...conv,
        messages: conv.messages.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)),
      })),
    )

    if (selectedConversation) {
      setSelectedConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((msg) => (msg.id === messageId ? { ...msg, status } : msg)),
            }
          : null,
      )
    }
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
          id: Date.now() + Math.random(),
          senderId: 1,
          senderName: "You",
          senderType: "client",
          content: `Shared ${file.type.startsWith("image/") ? "an image" : "a file"}: ${file.name}`,
          timestamp: new Date().toISOString(),
          status: "sending",
          attachments: [attachment],
        }

        // Add message with attachment
        const updatedConversations = conversations.map((conv) => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              messages: [...conv.messages, message],
              lastMessage: message.content,
              lastMessageTime: new Date().toISOString(),
            }
          }
          return conv
        })

        setConversations(updatedConversations)
        setSelectedConversation({
          ...selectedConversation,
          messages: [...selectedConversation.messages, message],
          lastMessage: message.content,
          lastMessageTime: new Date().toISOString(),
        })

        // Simulate upload completion
        setTimeout(() => updateMessageStatus(message.id, "sent"), 1000)
        setTimeout(() => updateMessageStatus(message.id, "delivered"), 2000)
      }
      reader.readAsDataURL(file)
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />
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

  const markAsRead = (conversationId: number) => {
    setConversations(conversations.map((conv) => (conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv)))
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
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
                      onClick={() => {
                        setSelectedConversation(conversation)
                        if (conversation.unreadCount > 0) {
                          markAsRead(conversation.id)
                        }
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.artistAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {conversation.artistName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                        {conversation.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{conversation.artistName}</h4>
                          <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-gray-500">{conversation.artistSpecialty} Specialist</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.artistAvatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {selectedConversation.artistName
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
                        <h3 className="font-semibold">{selectedConversation.artistName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="h-3 w-3" />
                          <span>{selectedConversation.artistSpecialty} Specialist</span>
                          {selectedConversation.isOnline && (
                            <Badge variant="secondary" className="text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
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
                          <DropdownMenuItem>View Artist Profile</DropdownMenuItem>
                          <DropdownMenuItem>View Appointments</DropdownMenuItem>
                          <DropdownMenuItem>Clear Chat History</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0">
                  <ScrollArea className="h-[450px] p-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderType === "client" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderType === "client" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
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
                              {message.senderType === "client" && (
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
                  <div className="border-t p-4">
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
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="p-12 text-center">
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
