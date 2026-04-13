"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowLeft, Fingerprint } from "lucide-react"
import { toast } from "sonner"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
})

const recoverSchema = z.object({
  email: z.string().email("Email inválido"),
  newPassword: z.string().min(6, "Mínimo 6 caracteres"),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>
type RecoverFormData = z.infer<typeof recoverSchema>

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess?: () => void
}

type AuthMode = "login" | "register" | "recover"

export function AuthModal({
  open,
  onOpenChange,
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login")
  const { login, register, loginWithPasskey, recoverWithPasskey, user } = useAuth()
  const prevUserRef = useRef(user)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "" },
  })

  const recoverForm = useForm<RecoverFormData>({
    resolver: zodResolver(recoverSchema),
    defaultValues: { email: "", newPassword: "" },
  })

  useEffect(() => {
    if (user && !prevUserRef.current && open) {
      onOpenChange(false)
      onAuthSuccess?.()
    }
    prevUserRef.current = user
  }, [user, open, onOpenChange, onAuthSuccess])

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setMode("login")
        loginForm.reset()
        registerForm.reset()
        recoverForm.reset()
      }, 200)
    }
  }, [open, loginForm, registerForm, recoverForm])

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    try {
      await register(data)
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasskeyLogin = async () => {
    const email = loginForm.getValues("email")
    if (!email) {
      toast.error("Ingresa tu email primero")
      return
    }
    setIsSubmitting(true)
    try {
      await loginWithPasskey(email)
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRecover = async (data: RecoverFormData) => {
    setIsSubmitting(true)
    try {
      await recoverWithPasskey(data)
      setMode("login")
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 bg-background p-0">
        <div className="relative p-6 pb-4">
          {mode !== "login" && (
            <button 
              onClick={() => setMode("login")}
              className="absolute left-4 top-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h2 className={cn("text-lg font-semibold", mode !== "login" && "ml-6")}>
            {mode === "login" && "Iniciar sesión"}
            {mode === "register" && "Crear cuenta"}
            {mode === "recover" && "Recuperar con Passkey"}
          </h2>
          <p className={cn("mt-1 text-sm text-muted-foreground", mode !== "login" && "ml-6")}>
            {mode === "recover" ? "Usa tu huella/rostro para cambiar tu contraseña" : "Bienvenido a BiblioChat"}
          </p>
        </div>

        <div className="px-6 pb-6">
          {mode === "login" && (
            <div className="space-y-4">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
                <Input {...loginForm.register("email")} type="email" placeholder="Email" />
                <Input {...loginForm.register("password")} type="password" placeholder="Contraseña" />
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => setMode("recover")}
                    className="text-xs text-primary hover:underline"
                  >
                    ¿Olvidaste tu contraseña? (Recuperar con Passkey)
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar con contraseña"}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">O también</span></div>
              </div>

              <Button 
                variant="outline" 
                className="w-full gap-2" 
                onClick={handlePasskeyLogin} 
                disabled={isSubmitting}
              >
                <Fingerprint className="h-4 w-4" />
                Iniciar con Passkey
              </Button>
            </div>
          )}

          {mode === "register" && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input {...registerForm.register("firstName")} placeholder="Nombre" />
                <Input {...registerForm.register("lastName")} placeholder="Apellido" />
              </div>
              <Input {...registerForm.register("email")} type="email" placeholder="Email" />
              <Input {...registerForm.register("password")} type="password" placeholder="Contraseña" />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
              </Button>
            </form>
          )}

          {mode === "recover" && (
            <form onSubmit={recoverForm.handleSubmit(handleRecover)} className="space-y-3">
              <Input {...recoverForm.register("email")} type="email" placeholder="Email de tu cuenta" />
              <Input {...recoverForm.register("newPassword")} type="password" placeholder="Nueva contraseña" />
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                <Fingerprint className="h-4 w-4" />
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar y Cambiar"}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Debes tener una Passkey registrada previamente para usar este método.
              </p>
            </form>
          )}

          {mode !== "recover" && (
            <div className="mt-4 border-t pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-foreground font-semibold hover:underline"
                >
                  {mode === "login" ? "Regístrate" : "Inicia sesión"}
                </button>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
