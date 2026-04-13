import { createContext, useContext } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import instanceAxios from "@/interceptors/instanceAxios"
import { toast } from "sonner"
import { startRegistration, startAuthentication } from "@simplewebauthn/browser"

interface User {
  id: number
  email: string
  authenticators?: any[]
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    address?: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  registerPasskey: (name: string) => Promise<void>
  deletePasskey: (credentialID: string) => Promise<void>
  loginWithPasskey: (email: string) => Promise<void>
  recoverWithPasskey: (data: RecoverData) => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
}

interface RecoverData {
  email: string
  newPassword: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: any }) {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const response = await instanceAxios.get("/auth/me")
        return response.data
      } catch {
        return null
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    throwOnError: false,
  })

  const login = async (email: string, password: string) => {
    try {
      const response = await instanceAxios.post("/auth/login", { email, password })
      localStorage.setItem("token", response.data.access_token)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success("Bienvenido de nuevo")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al iniciar sesión")
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await instanceAxios.post("/auth/register", data)
      localStorage.setItem("token", response.data.access_token)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success("Cuenta creada exitosamente")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al registrarse")
      throw error
    }
  }

  const registerPasskey = async (name: string) => {
    try {
      const optionsRes = await instanceAxios.get("/auth/passkey/register-options")
      const attResp = await startRegistration(optionsRes.data)
      await instanceAxios.post("/auth/passkey/register-verify", {
        response: attResp,
        name
      })
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success(`Passkey "${name}" registrada con éxito`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al registrar Passkey")
      throw error
    }
  }

  const deletePasskey = async (credentialID: string) => {
    try {
      await instanceAxios.delete(`/auth/passkey/${encodeURIComponent(credentialID)}`)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success("Passkey eliminada")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar Passkey")
      throw error
    }
  }

  const loginWithPasskey = async (email: string) => {
    try {
      const optionsRes = await instanceAxios.post("/auth/passkey/login-options", { email })
      const asseResp = await startAuthentication(optionsRes.data)
      const verifyRes = await instanceAxios.post("/auth/passkey/login-verify", {
        email,
        response: asseResp
      })
      localStorage.setItem("token", verifyRes.data.access_token)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success("Sesión iniciada con Passkey")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al usar Passkey")
      throw error
    }
  }

  const recoverWithPasskey = async (data: RecoverData) => {
    try {
      const optionsRes = await instanceAxios.post("/auth/passkey/login-options", { email: data.email })
      const asseResp = await startAuthentication(optionsRes.data)
      await instanceAxios.post("/auth/passkey/recovery-reset", {
        email: data.email,
        response: asseResp,
        name: data.email, // fallback
        newPassword: data.newPassword
      })
      toast.success("Contraseña restablecida. Ahora puedes iniciar sesión.")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al recuperar cuenta")
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    queryClient.setQueryData(["me"], null)
    toast.success("Sesión cerrada")
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        login,
        register,
        logout,
        registerPasskey,
        deletePasskey,
        loginWithPasskey,
        recoverWithPasskey,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
