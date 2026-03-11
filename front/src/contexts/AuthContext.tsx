import { createContext, useContext } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import instanceAxios from "@/interceptors/instanceAxios"
import { toast } from "sonner"

interface User {
  id: number
  email: string
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
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
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

  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => {
      const response = await instanceAxios.post("/auth/login", {
        email,
        password,
      })
      return response.data
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.access_token)
      queryClient.invalidateQueries({ queryKey: ["me"] })
      toast.success("Welcome back!")
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Login failed")
      throw error
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (registerData: RegisterData) => {
      const response = await instanceAxios.post("/auth/register", registerData)
      return response.data
    },
    onSuccess: () => {
      toast.success("Account created successfully! Please login.")
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Registration failed")
      throw error
    },
  })

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password })
  }

  const register = async (data: RegisterData) => {
    await registerMutation.mutateAsync(data)
  }

  const logout = () => {
    localStorage.removeItem("token")
    queryClient.setQueryData(["me"], null)
    toast.success("Logged out successfully")
  }

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        login,
        register,
        logout,
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
