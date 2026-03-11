import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./routes/page.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createBrowserRouter } from "react-router"
import { RouterProvider } from "react-router"
import { AuthProvider } from "@/contexts/AuthContext.tsx"
import HistoryPage from "./routes/history/page.tsx"
import Profile from "./routes/profile/page.tsx"

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/chat/:slug",
    element: <App />,
  },
  {
    path: "/history",
    element: <HistoryPage />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
