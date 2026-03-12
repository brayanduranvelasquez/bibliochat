"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router"
import instanceAxios from "@/interceptors/instanceAxios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"

const ITEMS_PER_PAGE = 9

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
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [activeTab, setActiveTab] = useState("all")

  // Reset page when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
    setSearchQuery("")
  }

  // Data for Form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    published: true,
  })

  // Queries
  const { data: publicBooks, isLoading: loadingPublic } = useQuery<Book[]>({
    queryKey: ["books", "public"],
    queryFn: async () => {
      const res = await instanceAxios.get("/books")
      return res.data
    },
  })

  const { data: myBooks, isLoading: loadingMy } = useQuery<Book[]>({
    queryKey: ["books", "me"],
    queryFn: async () => {
      const res = await instanceAxios.get("/books/me")
      return res.data
    },
    enabled: !!user,
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
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error("El título es obligatorio")
      return
    }
    createMutation.mutate(formData)
  }

  // Filter and paginate books based on active tab
  const booksToShow = activeTab === "all" ? publicBooks : myBooks
  const filteredBooks = useMemo(() => {
    if (!booksToShow) return []
    if (!searchQuery.trim()) return booksToShow
    const query = searchQuery.toLowerCase()
    return booksToShow.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.firstName.toLowerCase().includes(query) ||
        book.author.lastName.toLowerCase().includes(query)
    )
  }, [booksToShow, searchQuery])

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredBooks, currentPage])

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE)

  // Render book card
  const BookCard = ({ book }: { book: Book }) => (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg leading-tight font-bold">
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
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {book.description || "Sin descripción disponible."}
        </p>
      </CardContent>
      <CardFooter className="flex shrink-0 items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-2 pt-0">
        <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          ID: {book.id}
        </span>
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
              <Button
                onClick={() => setIsAdding(!isAdding)}
                className="gap-2 shadow-sm"
              >
                {isAdding ? (
                  "Ver libros"
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Publicar Libro
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6 lg:p-8">
        {isAdding ? (
          <div className="mx-auto max-w-2xl animate-in duration-500 fade-in slide-in-from-bottom-4">
            <div className="mb-8 space-y-2 text-center">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Plus className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Publicar nuevo libro
              </h2>
              <p className="text-muted-foreground">
                Comparte tus conocimientos con la comunidad.
              </p>
            </div>

            <Card className="overflow-hidden border-border/50 shadow-2xl">
              <div className="h-2 bg-linear-to-r from-primary/50 via-primary to-primary/50" />
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-8">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">
                      Título del libro
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ej: El arte de la guerra"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="h-11 bg-muted/30 focus-visible:ring-primary/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold"
                    >
                      Resumen / Descripción
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="De qué trata este libro..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="min-h-[140px] resize-none bg-muted/30 focus-visible:ring-primary/20"
                    />
                  </div>

                  <div className="flex items-start space-x-3 rounded-2xl border bg-muted/10 p-4 transition-all hover:bg-muted/20 hover:shadow-inner">
                    <div className="mt-1">
                      <Checkbox
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, published: !!checked })
                        }
                      />
                    </div>
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="published"
                        className="flex cursor-pointer items-center gap-2 text-sm font-bold"
                      >
                        {formData.published ? (
                          <Globe className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-orange-500" />
                        )}
                        {formData.published
                          ? "Visible al público"
                          : "Privado (Solo para ti)"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {formData.published
                          ? "Otros usuarios podrán ver y preguntar sobre este libro en la biblioteca global."
                          : "Este libro solo aparecerá en tu colección personal y no será visible para otros."}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="mt-6 flex gap-4 border-t bg-muted/30 p-6">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11 flex-1"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 flex-1 gap-2 shadow-md"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Publicar libro
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="all" onValueChange={handleTabChange} className="w-full">
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Colección de Libros
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Explora los libros disponibles o gestiona los tuyos.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título o autor..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-10 w-full pl-9 sm:w-[240px]"
                  />
                </div>
                <TabsList className="h-12 rounded-xl bg-muted/50 p-1">
                  <TabsTrigger
                    value="all"
                    className="rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Públicos
                  </TabsTrigger>
                  {user && (
                    <TabsTrigger
                      value="mine"
                      className="rounded-lg px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      Mis Publicaciones
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>

            <TabsContent value="all" className="mt-0 outline-none">
              {loadingPublic ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-[220px] animate-pulse rounded-2xl bg-muted/50"
                    />
                  ))}
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-6 rounded-[2.5rem] border border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/5 blur-2xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border bg-background shadow-xl">
                      <BookIcon className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">
                      {searchQuery ? "No se encontraron libros" : "Sin libros públicos"}
                    </h3>
                    <p className="mx-auto max-w-sm text-muted-foreground">
                      {searchQuery
                        ? "Intenta con otros términos de búsqueda."
                        : "La biblioteca está esperando su primer tesoro. ¿Quieres ser el primero en publicar?"}
                    </p>
                  </div>
                  {user && (
                    <Button
                      onClick={() => setIsAdding(true)}
                      className="h-auto rounded-full px-8 py-6 text-lg"
                    >
                      Publicar mi primer libro
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid animate-in auto-rows-fr grid-cols-1 gap-6 duration-700 fade-in slide-in-from-bottom-2 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="flex items-center px-4 text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="mine" className="mt-0 outline-none">
              {loadingMy ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-[220px] animate-pulse rounded-2xl bg-muted/50"
                    />
                  ))}
                </div>
              ) : !user ? (
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-6 rounded-[2.5rem] border border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border bg-background text-muted-foreground/30 shadow-xl">
                    <Plus className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">
                      Inicia sesión para ver tus libros
                    </h3>
                    <p className="mx-auto max-w-sm text-muted-foreground">
                      Debes iniciar sesión para ver tus publicaciones.
                    </p>
                  </div>
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="flex h-[50vh] flex-col items-center justify-center space-y-6 rounded-[2.5rem] border border-dashed border-muted-foreground/20 bg-muted/5 p-12 text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border bg-background text-muted-foreground/30 shadow-xl">
                    <Plus className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">
                      {searchQuery ? "No se encontraron libros" : "Tu estantería está vacía"}
                    </h3>
                    <p className="mx-auto max-w-sm text-muted-foreground">
                      {searchQuery
                        ? "Intenta con otros términos de búsqueda."
                        : "Aquí aparecerán los libros que subas, ya sean públicos o privados."}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="h-auto rounded-full px-8 py-6 text-lg"
                  >
                    Empezar a subir
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid animate-in auto-rows-fr grid-cols-1 gap-6 duration-700 fade-in slide-in-from-bottom-2 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedBooks.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="flex items-center px-4 text-sm">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
