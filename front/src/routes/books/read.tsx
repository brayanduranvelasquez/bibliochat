"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { useQuery } from "@tanstack/react-query"
import instanceAxios from "@/interceptors/instanceAxios"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  Loader2, 
  ChevronLeft,
  ChevronRight,
  Settings
} from "lucide-react"

interface Book {
  id: number
  title: string
  description: string | null
  author: {
    firstName: string
    lastName: string
  }
}

export default function BookReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [page, setPage] = useState(1)

  const { data: book, isLoading } = useQuery<Book>({
    queryKey: ["book", id],
    queryFn: async () => {
      const res = await instanceAxios.get(`/books/${id}`)
      return res.data
    }
  })

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">Abriendo libro...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      {/* Reader Header */}
      {!isFullscreen && (
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/books")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold leading-none line-clamp-1">{book?.title}</h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
                  {book?.author?.firstName} {book?.author?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2">
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Pantalla completa</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area (Google Docs Style) */}
      <main className={`flex-1 overflow-auto p-4 sm:p-8 flex justify-center ${isFullscreen ? 'bg-[#f8f9fa] pt-12' : 'bg-muted/10'}`}>
        <div className="relative group w-full max-w-[850px]">
          {/* Floating Actions when Fullscreen */}
          {isFullscreen && (
            <div className="fixed top-4 right-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <Button variant="secondary" size="icon" onClick={toggleFullscreen} className="bg-white/80 backdrop-blur shadow-md hover:bg-white text-black border">
                  <Minimize2 className="h-5 w-5" />
               </Button>
            </div>
          )}

          {/* The "Paper" */}
          <div className="mx-auto bg-white shadow-[0_0_10px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.1)] min-h-[1100px] w-full px-12 py-16 sm:px-20 sm:py-24 animate-in fade-in zoom-in-95 duration-500">
             <div className="max-w-none text-[#202124] prose prose-slate">
                <header className="mb-12 border-b pb-8 text-center decoration-primary">
                    <h2 className="text-4xl font-serif font-black text-gray-900 tracking-tight leading-tight mb-4">
                      {book?.title || "Cargando..."}
                    </h2>
                    <div className="flex items-center justify-center gap-3 text-muted-foreground font-medium">
                        <span className="h-px w-8 bg-muted-foreground/30"></span>
                        <p className="text-sm italic uppercase tracking-widest">{book?.author?.firstName} {book?.author?.lastName}</p>
                        <span className="h-px w-8 bg-muted-foreground/30"></span>
                    </div>
                </header>

                <div className="font-serif text-lg leading-[1.8] text-gray-800 space-y-8 text-justify">
                   <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                     En un lugar de la Mancha, de cuyo nombre no quiero acordarme, no ha mucho tiempo que vivía un hidalgo de los de lanza en astillero, adarga antigua, rocín flaco y galgo corredor. Una olla de algo más vaca que carnero, salpicón las más noches, duelos y quebrantos los sábados, lantejas los viernes, algún palomino de añadidura los domingos, consumían las tres partes de su hacienda.
                   </p>

                   <p>
                     El resto della concluían sayo de velarte, calzas de velludo para las fiestas con sus pantuflos de lo mismo, y los días de entresemana se honraba con su vellori de lo más fino. Tenía en su casa una ama que pasaba de los cuarenta, y una sobrina que no llegaba a los veinte, y un mozo de campo y plaza, que así ensillaba el rocín como tomaba la podadera. Frisaba la edad de nuestro hidalgo con los cincuenta años; era de complexión recia, seco de carnes, enjuto de rostro, gran madrugador y amigo de la caza. Quieren decir que tenía el sobrenombre de Quijada, o Quesada, que en esto hay alguna diferencia en los autores que deste caso escriben; aunque por conjeturas verosímiles se deja entender que se llamaba Quijana. Pero esto importa poco a nuestro cuento; basta que en la narración dél no se salga un punto de la verdad.
                   </p>

                   <div className="py-6 flex justify-center">
                      <div className="h-1 w-12 rounded-full bg-primary/20"></div>
                   </div>

                   <h3 className="text-2xl font-serif font-bold text-gray-900">Capítulo I</h3>

                   <p>
                      Es, pues, de saber que este sobredicho hidalgo, los ratos que estaba ocioso —que eran los más del año—, se daba a leer libros de caballerías, con tanta afición y gusto, que olvidó casi de todo punto el ejercicio de la caza, y aun la administración de su hacienda; y llegó a tanto su curiosidad y desatino en esto, que vendió muchas hanegas de tierra de sembradura para comprar libros de caballerías en que leer, y así, llevó a su casa todos cuantos pudo haber dellos; y de todos, ningunos le parecían tan bien como los que compuso el famoso Feliciano de Silva.
                   </p>

                   <p>
                     Con estas razones perdía el pobre caballero el juicio, y desvelábase por entenderlas y desentrañarles el sentido, que no se lo sacara ni las entendiera el mesmo Aristóteles, si resucitara para solo ello. No estaba muy bien con las heridas que don Belianís daba y recibía, porque se imaginaba que, por grandes maestros que le hubiesen curado, no dejaría de tener el rostro y todo el cuerpo lleno de cicatrices y señales.
                   </p>
                </div>
             </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 mb-12 flex items-center justify-between">
            <Button variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Página {page} de 42
            </div>
            <Button variant="ghost" onClick={() => setPage(page + 1)} className="gap-2">
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Mini Progress Footer */}
      {!isFullscreen && (
        <footer className="h-1.5 w-full bg-muted border-t">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(page / 42) * 100}%` }}></div>
        </footer>
      )}
    </div>
  )
}
