"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import instanceAxios from "@/interceptors/instanceAxios"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  Trash2,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Conversation {
  id: number
  slug: string
  title: string
  updatedAt: string
}

export default function HistoryPage() {
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  const { data: conversations, isLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await instanceAxios.get("/chat/conversations")
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      await instanceAxios.delete(`/chat/conversations/${slug}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
      toast.success("Conversación eliminada")
      setDeleteDialogOpen(false)
    },
    onError: () => {
      toast.error("Error al eliminar la conversación")
    },
  })

  const handleDelete = (slug: string) => {
    setSelectedSlug(slug)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (selectedSlug) {
      deleteMutation.mutate(selectedSlug)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Historial de Chats</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6">
        {isLoading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations?.length === 0 ? (
          <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">No hay conversaciones</h2>
              <p className="text-muted-foreground text-sm">
                Tus conversaciones pasadas aparecerán aquí.
              </p>
            </div>
            <Button asChild>
              <Link to="/">Iniciar nuevo chat</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {conversations?.map((conv) => (
              <div
                key={conv.id}
                className="group relative flex items-center gap-4 rounded-2xl border bg-muted/30 p-4 transition-all hover:bg-muted/50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="h-5 w-5" />
                </div>
                
                <Link
                  to={`/chat/${conv.slug}`}
                  className="flex flex-1 flex-col overflow-hidden"
                >
                  <span className="truncate font-medium text-foreground">
                    {conv.title || "Nueva conversación"}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {format(new Date(conv.updatedAt), "PPPP", { locale: es })}
                  </span>
                </Link>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(conv.slug)}
                    className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="h-9 w-9">
                    <Link to={`/chat/${conv.slug}`}>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              conversación y todos sus mensajes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
