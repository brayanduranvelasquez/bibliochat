"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router"
import instanceAxios from "@/interceptors/instanceAxios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Library, 
  Plus, 
  User, 
  Globe, 
  Lock, 
  Loader2, 
  ArrowLeft,
  BookOpen,
  Book as BookIcon,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

interface Book {
  id: number
  title: string
  description: string | null
  published: boolean
  author: {
    firstName: string
    lastName: string
  }
}

export default function BooksPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAdding, setIsAdding] = useState(false)
  
  // Data for Form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    published: true
  })

  // Queries
  const { data: publicBooks, isLoading: loadingPublic } = useQuery<Book[]>({
    queryKey: ["books", "public"],
    queryFn: async () => {
      const res = await instanceAxios.get("/books")
      return res.data
    }
  })

  const { data: myBooks, isLoading: loadingMy } = useQuery<Book[]>({
    queryKey: ["books", "me"],
    queryFn: async () => {
      const res = await instanceAxios.get("/books/me")
      return res.data
    },
    enabled: !!user
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await instanceAxios.post("/books", data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] })
      toast.success("Libro publicado con éxito")
      setIsAdding(false)
      setFormData({ title: "", description: "", published: true })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error al publicar el libro")
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error("El título es obligatorio")
      return
    }
    createMutation.mutate(formData)
  }

  // Render book card
  const BookCard = ({ book }: { book: Book }) => (
    <Card className="flex flex-col h-full overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg font-bold leading-tight">
            {book.title}
          </CardTitle>
          {book.published ? (
            <Globe className="h-4 w-4 shrink-0 text-primary" />
          ) : (
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </div>
        <CardDescription className="flex items-center gap-1.5 text-xs">
          <User className="h-3 w-3" />
          {book.author?.firstName || "Anónimo"} {book.author?.lastName || ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="line-clamp-4 text-sm text-muted-foreground leading-relaxed">
          {book.description || "Sin descripción disponible."}
        </p>
      </CardContent>
      <CardFooter className="pt-0 border-t border-border/50 bg-muted/20 px-4 py-2 flex justify-between items-center shrink-0">
         <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">ID: {book.id}</span>
         <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1.5 text-xs text-primary hover:text-primary"
            onClick={() => navigate(`/books/${book.id}/read`)}
         >
            <BookOpen className="h-3.5 w-3.5" />
            Leer
         </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                <Library className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Biblioteca</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
             {user && (
              <Button onClick={() => setIsAdding(!isAdding)} className="gap-2 shadow-sm">
                {isAdding ? "Ver libros" : <><Plus className="h-4 w-4" /> Publicar Libro</>}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6 lg:p-8">
        {isAdding ? (
          <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 space-y-2 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Plus className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Publicar nuevo libro</h2>
              <p className="text-muted-foreground">Comparte tus conocimientos con la comunidad.</p>
            </div>
            
            <Card className="border-border/50 shadow-2xl overflow-hidden">
              <div className="h-2 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-8">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">Título del libro</Label>
                    <Input 
                      id="title"
                      placeholder="Ej: El arte de la guerra"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="h-11 bg-muted/30 focus-visible:ring-primary/20"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Resumen / Descripción</Label>
                    <Textarea 
                      id="description"
                      placeholder="De qué trata este libro..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="min-h-[140px] bg-muted/30 focus-visible:ring-primary/20 resize-none"
                    />
                  </div>

                  <div className="flex items-start space-x-3 rounded-2xl border bg-muted/10 p-4 transition-all hover:bg-muted/20 hover:shadow-inner">
                    <div className="mt-1">
                      <Checkbox 
                        id="published" 
                        checked={formData.published}
                        onCheckedChange={(checked) => setFormData({...formData, published: !!checked})}
                      />
                    </div>
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="published" className="text-sm font-bold flex items-center gap-2 cursor-pointer">
                        {formData.published ? <Globe className="h-3.5 w-3.5 text-primary" /> : <Lock className="h-3.5 w-3.5 text-orange-500" />}
                        {formData.published ? "Visible al público" : "Privado (Solo para ti)"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.published 
                          ? "Otros usuarios podrán ver y preguntar sobre este libro en la biblioteca global." 
                          : "Este libro solo aparecerá en tu colección personal y no será visible para otros."}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4 p-6 bg-muted/30 border-t">
                  <Button type="button" variant="ghost" className="flex-1 h-11" onClick={() => setIsAdding(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 h-11 gap-2 shadow-md" disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Publicar libro
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Colección de Libros</h2>
                <p className="text-sm text-muted-foreground mt-1">Explora los libros disponibles o gestiona los tuyos.</p>
              </div>
              <div className="flex items-center gap-3">
                <TabsList className="h-12 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="all" className="px-5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Públicos
                  </TabsTrigger>
                  {user && (
                    <TabsTrigger value="mine" className="px-5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      Mios
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>

            <TabsContent value="all" className="mt-0 outline-none">
               {loadingPublic ? (
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                   {[1,2,3,4,5,6].map(i => <div key={i} className="h-[220px] animate-pulse rounded-2xl bg-muted/50" />)}
                 </div>
               ) : publicBooks?.length === 0 ? (
                  <div className="flex h-[50vh] flex-col items-center justify-center space-y-6 rounded-[2.5rem] border border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl" />
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-background shadow-xl border">
                        <BookIcon className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Sin libros públicos</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto">La biblioteca está esperando su primer tesoro. ¿Quieres ser el primero en publicar?</p>
                    </div>
                    {user && <Button onClick={() => setIsAdding(true)} className="rounded-full px-8 py-6 h-auto text-lg">Publicar mi primer libro</Button>}
                  </div>
               ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {publicBooks?.map(book => <BookCard key={book.id} book={book} />)}
                  </div>
               )}
            </TabsContent>

            <TabsContent value="mine" className="mt-0 outline-none">
               {loadingMy ? (
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                   {[1,2,3].map(i => <div key={i} className="h-[220px] animate-pulse rounded-2xl bg-muted/50" />)}
                 </div>
               ) : myBooks?.length === 0 ? (
                  <div className="flex h-[50vh] flex-col items-center justify-center space-y-6 rounded-[2.5rem] border border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-background shadow-xl border text-muted-foreground/30">
                        <Plus className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-bold">Tu estantería está vacía</h3>
                       <p className="text-muted-foreground max-w-sm mx-auto">Aquí aparecerán los libros que subas, ya sean públicos o privados.</p>
                    </div>
                    <Button onClick={() => setIsAdding(true)} className="rounded-full px-8 py-6 h-auto text-lg">Empezar a subir</Button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {myBooks?.map(book => <BookCard key={book.id} book={book} />)}
                  </div>
               )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
