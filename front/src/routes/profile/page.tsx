"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
} from "lucide-react"
import { useNavigate } from "react-router"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-sm space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Acceso restringido</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Inicia sesión para ver tu perfil
            </p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const fullName =
    [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ") || "Usuario"

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="font-medium">Perfil</h1>
          <div className="w-16" />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Card>
            <CardContent className="space-y-3 p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Información
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between border-b py-2">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Email</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b py-2">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Nombre</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {fullName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b py-2">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Teléfono</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {user.profile?.phone || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Dirección</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {user.profile?.address || "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Cuenta
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between border-b py-2">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">ID</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    #{user.id}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Miembro desde</span>
                  </div>
                  <span className="text-sm text-muted-foreground">2026</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}
