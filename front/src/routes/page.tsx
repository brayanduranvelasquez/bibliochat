"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useAuth } from "@/contexts/AuthContext"
import { AuthModal } from "@/components/auth/AuthModal"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Link, useParams, useNavigate } from "react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import instanceAxios from "@/interceptors/instanceAxios"
import type { UIMessage } from "ai"
import {
  Bot,
  User,
  Loader2,
  Sparkles,
  ArrowUp,
  FileText,
  Library,
  Zap,
  Plus,
  History,
  ChevronRight,
} from "lucide-react"

export function App() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, isLoading: authLoading } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const isFreshChatRef = useRef(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const prevUserRef = useRef(user)
  const hasSentPendingRef = useRef(false)

  // Fetch recent conversations for landing
  const { data: recentConversations } = useQuery({
    queryKey: ["recent-conversations"],
    queryFn: async () => {
      const res = await instanceAxios.get("/chat/conversations")
      return res.data.slice(0, 3)
    },
    enabled: !!user && !slug,
  })

  // Fetch conversation history if slug exists
  const { data: historyData } = useQuery({
    queryKey: ["conversation", slug],
    queryFn: async () => {
      const res = await instanceAxios.get(`/chat/conversations/${slug}`)
      return res.data
    },
    enabled: !!slug && !!user,
  })

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "http://localhost:3000/chat",
      headers: () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }),
      body: () => ({
        slug: slug || undefined,
      }),
    }),
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-conversations"] })
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  // Load history into useChat messages
  useEffect(() => {
    if (historyData?.messages) {
      const formattedMessages: UIMessage[] = historyData.messages.map((m: any) => ({
        id: m.id.toString(),
        role: m.type === "user" ? "user" : "assistant",
        content: m.content,
        parts: [{ type: "text", text: m.content }],
        createdAt: new Date(m.createdAt),
      }))
      setMessages(formattedMessages)

      // If this was just initialized, trigger the AI response
      if (isFreshChatRef.current) {
        isFreshChatRef.current = false
        sendMessage(undefined, { body: { slug } })
      }
    } else if (!slug) {
      setMessages([])
    }
  }, [historyData, slug, setMessages, sendMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 128)}px`
    }
  }, [input])

  useEffect(() => {
    if (
      user &&
      !prevUserRef.current &&
      pendingMessage &&
      !hasSentPendingRef.current
    ) {
      hasSentPendingRef.current = true
      const msg = pendingMessage
      setPendingMessage(null)
      setInput("")
      sendMessage({ text: msg })
    }
    prevUserRef.current = user
  }, [user, pendingMessage, sendMessage])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const messageText = input?.trim()
    if (!messageText || isInitializing) return

    if (!user) {
      setPendingMessage(messageText)
      setAuthModalOpen(true)
      return
    }

    if (!slug) {
      setIsInitializing(true)
      try {
        const res = await instanceAxios.post("/chat/start", {
          message: messageText,
        })
        const newSlug = res.data.slug
        isFreshChatRef.current = true
        setInput("")
        setMessages([]) // Limpiar mensajes locales antes de navegar
        navigate(`/chat/${newSlug}`)
      } catch (err) {
        console.error("Error starting chat:", err)
        toast.error("Error al iniciar la conversación")
      } finally {
        setIsInitializing(false)
      }
    } else {
      setInput("")
      sendMessage({ text: messageText }, { body: { slug } })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderMessageContent = (message: UIMessage) => {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {part.text}
        </div>
      ))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md" />
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-lg font-semibold tracking-tight">
                BiblioChat
              </h1>
            </Link>

            {user && (
              <div className="ml-2 flex items-center gap-1 border-l pl-2 sm:ml-4 sm:pl-4">
                {slug && (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => { setMessages([]); navigate("/"); }} className="hidden h-9 gap-2 px-3 sm:flex">
                      <Plus className="h-4 w-4 text-primary" />
                      <span>Nuevo</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setMessages([]); navigate("/"); }} className="h-9 w-9 sm:hidden">
                      <Plus className="h-4 w-4 text-primary" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" asChild className="hidden h-9 gap-2 px-3 sm:flex">
                  <Link to="/history">
                    <History className="h-4 w-4 text-primary" />
                    <span>Historial</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 sm:hidden">
                  <Link to="/history">
                    <History className="h-4 w-4 text-primary" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="hidden h-9 gap-2 px-3 sm:flex">
                  <Link to="/books">
                    <Library className="h-4 w-4 text-primary" />
                    <span>Biblioteca</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 sm:hidden">
                  <Link to="/books">
                    <Library className="h-4 w-4 text-primary" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden h-auto items-center gap-2 px-3 py-1.5 sm:flex"
                >
                  <Link to="/profile">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                      <User className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium">{user.email}</span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="sm:hidden"
                >
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Container - Centrado */}
      <main className="flex flex-1 justify-center overflow-hidden">
        <div className="flex h-[calc(100vh-100px)] w-full max-w-3xl flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 px-4 py-12">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-primary/20 bg-linear-to-br from-primary/20 to-primary/5 shadow-xl">
                      <Bot className="h-10 w-10 text-primary" />
                    </div>
                  </div>

                  <div className="mt-12 max-w-sm space-y-3 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">
                      BiblioChat
                    </h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Tu asistente inteligente para explorar y gestionar
                      documentos de la biblioteca. Puedo ayudarte a buscar
                      libros, responder preguntas y más.
                    </p>
                  </div>

                  <div className="mt-10 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
                    {[
                      { icon: FileText, text: "Información de libros" },
                      { icon: Library, text: "Explorar colección" },
                      { icon: Zap, text: "Respuestas rápidas" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex cursor-default items-center gap-2 rounded-xl border border-muted bg-muted/50 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-muted"
                      >
                        <item.icon className="h-4 w-4 text-primary" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {user && recentConversations && recentConversations.length > 0 && (
                    <div className="mt-12 w-full max-w-lg space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-sm font-medium text-muted-foreground">Últimas conversaciones</h3>
                        <Button variant="link" size="sm" asChild className="h-auto p-0 text-xs font-semibold text-primary">
                          <Link to="/history">Ver todas</Link>
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        {recentConversations.map((conv: any) => (
                          <Link
                            key={conv.id}
                            to={`/chat/${conv.slug}`}
                            className="flex items-center gap-3 rounded-xl border bg-background p-3 text-sm transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <span className="flex-1 truncate font-medium">{conv.title || "Nueva conversación"}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex animate-in gap-4 duration-300 slide-in-from-bottom-2",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                      message.role === "assistant"
                        ? "bg-primary shadow-sm"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50"
                    )}
                  >
                    <div className="text-sm leading-relaxed">
                      {renderMessageContent(message)}
                    </div>
                  </div>
                </div>
              ))}

              {(status === "submitted" ||
                (status === "streaming" &&
                  messages.at(-1)?.role === "assistant" &&
                  (messages.at(-1)?.parts?.length ?? 0) === 0)) && (
                <div className="flex animate-in fade-in slide-in-from-bottom-2 gap-4 duration-300">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="rounded-2xl bg-muted/50 px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                    <Bot className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    Lo siento, ocurrió un error. Por favor intenta de nuevo.
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="relative flex items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring/20">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isInitializing ? "Iniciando chat..." : "Escribe un mensaje..."}
                  disabled={isInitializing}
                  rows={1}
                  className="max-h-32 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={!input?.trim() || isInitializing}
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {status === "streaming" || isInitializing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Enter para enviar • Shift + Enter para nueva línea
              </p>
            </form>
          </div>
        </div>
      </main>

      <AuthModal
        open={authModalOpen}
        onOpenChange={(open) => {
          setAuthModalOpen(open)
          if (!open && !user) {
            setPendingMessage(null)
          }
        }}
        onAuthSuccess={() => {
          if (pendingMessage) {
            const msg = pendingMessage
            setPendingMessage(null)
            setInput(msg)
            sendMessage({ text: msg })
          }
        }}
      />
    </div>
  )
}

export default App
