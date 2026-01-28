
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, Check, CheckCheck, Clock, Smile, ImageIcon, Trash2, MoreHorizontal } from "lucide-react"
import { supabase } from "@/lib/supabase-browser"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  sender?: {
    full_name: string
    avatar_url: string
  }
  attachments?: any[]
  status?: "sending" | "sent" | "delivered" | "read"
}

interface ChatInterfaceProps {
  conversationId: string
  currentUserId: string
  recipientName?: string
  recipientAvatar?: string
}

export default function ChatInterface({
  conversationId,
  currentUserId,
  recipientName = "Chat",
  recipientAvatar,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch initial messages and set up realtime subscription
  useEffect(() => {
    let channel: any

    const fetchMessages = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/conversations/${conversationId}/messages`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    const setupSubscription = () => {
      channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const newMessage = payload.new as Message
            // Only add if not already present (optimistic UI might have added it)
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMessage.id)) return prev
              return [...prev, newMessage]
            })
          }
        )
        .subscribe()
    }

    if (conversationId) {
      fetchMessages()
      setupSubscription()
    }

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [conversationId])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content: newMessage.trim(),
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      status: "sending",
    }

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage])
    setNewMessage("")

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tempMessage.content }),
      })

      if (res.ok) {
        const savedMessage = await res.json()
        setMessages((prev) => prev.map((m) => (m.id === tempId ? savedMessage : m)))
      } else {
        // Handle error (remove temp message or show error)
        console.error("Failed to send")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    // Optimistic delete
    setMessages((prev) => prev.filter((m) => m.id !== messageId))

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        console.error("Failed to delete message")
        // Optionally revert state here if needed
      }
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading chat...</div>
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={recipientAvatar || "/placeholder.svg"} />
          <AvatarFallback>{recipientName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{recipientName}</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isMe = message.sender_id === currentUserId
            return (
              <div key={message.id} className={`group flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`max-w-[75%] rounded-lg p-3 ${
                      isMe ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="flex items-center justify-end mt-1 gap-1">
                      <span className={`text-[10px] ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                        {formatTime(message.created_at)}
                      </span>
                      {isMe && message.status === "sending" && <Clock className="h-3 w-3 text-blue-200" />}
                    </div>
                  </div>

                  {isMe && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isMe ? "end" : "start"}>
                        <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
           <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="min-h-[40px] max-h-[120px] resize-none pr-10"
              rows={1}
            />
          </div>
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
