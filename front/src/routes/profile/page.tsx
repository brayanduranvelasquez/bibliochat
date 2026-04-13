"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Loader2,
  ChevronLeft,
  BookOpen,
  Calendar,
  Fingerprint,
  Plus,
  Trash2,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
} from "lucide-react"
import { useNavigate } from "react-router"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

export default function ProfilePage() {
  const { user, isLoading, logout, registerPasskey, deletePasskey } = useAuth()
  const navigate = useNavigate()

  const [isRegistering, setIsRegistering] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [newPasskeyName, setNewPasskeyName] = useState("")

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleStartPasskeyCeremony = () => {
    setShowNameDialog(true)
    setNewPasskeyName("")
  }

  const handleConfirmRegister = async () => {
    if (!newPasskeyName.trim()) return

    setShowNameDialog(false)
    setIsRegistering(true)
    try {
      await registerPasskey(newPasskeyName)
    } finally {
      setIsRegistering(false)
    }
  }

  const handleDeletePasskey = async (credentialID: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta llave?")) return

    setIsDeleting(credentialID)
    try {
      await deletePasskey(credentialID)
    } finally {
      setIsDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 text-white">
        <div className="max-w-sm space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-primary/40 text-primary/60">
            <User className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Acceso Privado
            </h2>
            <p className="text-muted-foreground">
              Debes autenticarte para visualizar esta sección.
            </p>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full border-primary/20 transition-transform hover:bg-primary/5 active:scale-95"
          >
            Regresar al inicio
          </Button>
        </div>
      </div>
    )
  }

  const fullName =
    [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ") || "Usuario"
  const passkeyCount = user.authenticators?.length || 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-100 selection:bg-primary/30">
      {/* Refined Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="group gap-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Explorar
          </Button>
          <span className="text-sm font-medium tracking-widest uppercase opacity-40">
            Perfil de Usuario
          </span>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <ScrollArea className="h-[calc(100vh-65px)]">
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl px-6 py-12"
        >
          {/* Hero Section */}
          <section className="mb-12 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-linear-to-br from-zinc-800 to-zinc-900 shadow-2xl">
                <User className="h-12 w-12 text-primary" />
              </div>
              {passkeyCount > 0 && (
                <div className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#0a0a0a] bg-primary text-white">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {fullName}
            </h2>
            <p className="font-medium text-zinc-400">{user.email}</p>
          </section>

          <Tabs defaultValue="info" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="h-12 border border-white/5 bg-zinc-900/50 p-1">
                <TabsTrigger
                  value="info"
                  className="px-8 data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Información
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="px-8 data-[state=active]:bg-primary data-[state=active]:text-white"
                >
                  Seguridad
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="info"
              className="space-y-6 outline-none focus-visible:outline-none"
            >
              <Card className="border-white/5 bg-black/40 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-medium">
                    Datos Personales
                  </CardTitle>
                  <CardDescription>
                    Detalles de contacto y membresía.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 pt-4">
                  <InfoRow icon={Mail} label="Email" value={user.email} />
                  <InfoRow
                    icon={User}
                    label="Nombre Completo"
                    value={fullName}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Teléfono"
                    value={user.profile?.phone || "Sin definir"}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Dirección"
                    value={user.profile?.address || "Sin definir"}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Miembro desde"
                    value="Abril, 2026"
                  />
                  <InfoRow
                    icon={BookOpen}
                    label="ID Único"
                    value={`#${user.id}`}
                  />
                </CardContent>
              </Card>

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300 active:scale-[0.98]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión de forma segura
              </Button>
            </TabsContent>

            <TabsContent
              value="security"
              className="space-y-6 outline-none focus-visible:outline-none"
            >
              <Card className="border-white/5 bg-black/40 shadow-xl backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-medium">
                      Passkeys
                    </CardTitle>
                    <CardDescription>
                      Acceso biométrico seguro ({passkeyCount}/5).
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleStartPasskeyCeremony}
                    disabled={isRegistering || passkeyCount >= 5}
                    className="bg-primary text-white shadow-lg transition-all hover:bg-primary/90 active:scale-95"
                  >
                    {isRegistering ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-1 h-3 w-3" />
                    )}
                    Vincular dispositivo
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-4 text-sm leading-relaxed text-zinc-400">
                    Las **Passkeys** te permiten iniciar sesión sin contraseñas
                    usando el sensor de huella o rostro de tu dispositivo. Son
                    más seguras y fáciles de usar.
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {user.authenticators?.map((auth: any) => (
                        <motion.div
                          key={auth.credentialID}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group flex items-center justify-between rounded-xl border border-white/5 bg-zinc-900/20 p-4 transition-colors hover:bg-zinc-900/40"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 transition-colors group-hover:text-primary">
                              <Smartphone className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-white">
                                {auth.name || "Dispositivo"}
                              </span>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="text-[10px] font-bold tracking-tighter text-zinc-600 uppercase">
                                  ID: {auth.credentialID.slice(0, 8)}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-zinc-800" />
                                <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                                  <CheckCircle2 className="h-2 w-2 text-emerald-500" />
                                  Activo
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeletePasskey(auth.credentialID)
                            }
                            disabled={isDeleting === auth.credentialID}
                            className="h-9 w-9 text-zinc-600 hover:bg-red-500/10 hover:text-red-400"
                          >
                            {isDeleting === auth.credentialID ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {passkeyCount === 0 && (
                      <div className="py-10 text-center">
                        <Fingerprint className="mx-auto mb-4 h-12 w-12 text-zinc-800" />
                        <p className="text-sm font-medium text-zinc-500 italic">
                          No hay llaves de seguridad registradas.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.main>
      </ScrollArea>

      {/* Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent className="max-w-[350px] border-white/10 bg-zinc-900 text-white">
          <DialogHeader>
            <DialogTitle>Nombre de la Passkey</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Usa un nombre común como "Mi iPhone" o "Windows Trabajo" para
              reconocerlo.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label
              htmlFor="passkey-name"
              className="mb-2 block text-xs tracking-widest uppercase opacity-50"
            >
              Identificador
            </Label>
            <Input
              id="passkey-name"
              placeholder="Ej: Laptop Personal"
              className="h-12 border-white/10 bg-black text-white"
              value={newPasskeyName}
              onChange={(e) => setNewPasskeyName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleConfirmRegister()}
            />
          </div>
          <div className="flex flex-col gap-3 pt-6">
            <Button
              onClick={handleConfirmRegister}
              disabled={!newPasskeyName.trim()}
              className="h-12 w-full bg-primary font-bold text-white hover:brightness-110 active:scale-[0.98]"
            >
              Vincular Dispositivo
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowNameDialog(false)}
              className="h-12 w-full text-zinc-500 hover:bg-white/5 hover:text-white"
            >
              Tal vez luego
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/3 py-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900/50 text-zinc-500">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-zinc-400">{label}</span>
      </div>
      <span className="max-w-[150px] truncate text-sm font-semibold">
        {value}
      </span>
    </div>
  )
}
