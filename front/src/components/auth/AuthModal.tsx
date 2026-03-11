"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@/contexts/AuthContext"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>
type RegisterFormData = z.infer<typeof registerSchema>

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess?: () => void
}

export function AuthModal({
  open,
  onOpenChange,
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const { login, register, user } = useAuth()
  const prevUserRef = useRef(user)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
    },
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
        loginForm.reset()
        registerForm.reset()
      }, 200)
    }
  }, [open, loginForm, registerForm])

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
      loginForm.reset()
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (data: RegisterFormData) => {
    setIsSubmitting(true)
    try {
      await register(data)
      setMode("login")
      registerForm.reset()
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 bg-background p-0">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login"
              ? "Ingresa tus credenciales"
              : "Completa tus datos"}
          </p>
        </div>

        <div className="px-6 pb-6">
          {mode === "login" ? (
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-3"
            >
              <div>
                <Input
                  {...loginForm.register("email")}
                  type="email"
                  placeholder="Email"
                  className="h-10"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  {...loginForm.register("password")}
                  type="password"
                  placeholder="Contraseña"
                  className="h-10"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          ) : (
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    {...registerForm.register("firstName")}
                    placeholder="Nombre"
                    className="h-9"
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="mt-1 text-xs text-destructive">
                      {registerForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    {...registerForm.register("lastName")}
                    placeholder="Apellido"
                    className="h-9"
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="mt-1 text-xs text-destructive">
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Input
                  {...registerForm.register("email")}
                  type="email"
                  placeholder="Email"
                  className="h-9"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  {...registerForm.register("password")}
                  type="password"
                  placeholder="Contraseña"
                  className="h-9"
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  {...registerForm.register("phone")}
                  placeholder="Teléfono (opc)"
                  className="h-8 text-sm"
                />
                <Input
                  {...registerForm.register("address")}
                  placeholder="Dirección (opc)"
                  className="h-8 text-sm"
                />
              </div>

              <Button
                type="submit"
                className="h-10 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Crear cuenta"
                )}
              </Button>
            </form>
          )}

          <div className="mt-4 border-t pt-4 text-center">
            {mode === "login" ? (
              <p className="text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-foreground hover:underline"
                >
                  Regístrate
                </button>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-foreground hover:underline"
                >
                  Inicia sesión
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
