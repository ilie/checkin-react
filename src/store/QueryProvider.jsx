import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "../helpers/api";
import AuthContext from "./auth-context";

// One query cache per login, so the next person on a shared phone never sees the last one's data.
export function QueryProvider({ children }) {
  const authCtx = useContext(AuthContext);

  return (
    <SessionQueryProvider key={authCtx.token ?? ""} authCtx={authCtx}>
      {children}
    </SessionQueryProvider>
  );
}

function SessionQueryProvider({ authCtx, children }) {
  const [queryClient] = useState(() => createQueryClient(authCtx));

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// The one place API errors end a session. Queries also show their error here;
// mutations show theirs where they're called, next to the success message.
function createQueryClient(authCtx) {
  function endSessionIfUnauthorized(error) {
    if (error.response?.status === 401) authCtx.clearLoginData();
  }

  return new QueryClient({
    defaultOptions: {
      // Like the app before: an error shows at once instead of after retries.
      queries: { retry: false },
    },
    queryCache: new QueryCache({
      onError(error, query) {
        endSessionIfUnauthorized(error);
        // A stored admin flag can outlive the user's admin rights. The API refuses, so drop the admin UI quietly.
        if (query.meta?.adminOnly && error.response?.status === 403) {
          authCtx.setAdminFalse();
          return;
        }
        // Offline, the banner already says why nothing loads.
        if (!error.response && !navigator.onLine) return;
        toast.error(apiErrorMessage(error));
      },
    }),
    mutationCache: new MutationCache({ onError: endSessionIfUnauthorized }),
  });
}
