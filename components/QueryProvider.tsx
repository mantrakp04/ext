import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { experimental_createQueryPersister } from '@tanstack/query-persist-client-core';
import { ReactNode } from 'react';

const persister = experimental_createQueryPersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
      persister: persister.persisterFn,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
