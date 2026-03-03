import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CategoryName } from "../backend.d";
import { useActor } from "./useActor";

export function useGetCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<CategoryName[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPuzzle(categoryName: CategoryName | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["puzzle", categoryName],
    queryFn: async () => {
      if (!actor || !categoryName) return null;
      return actor.getPuzzle(categoryName);
    },
    enabled: !!actor && !isFetching && !!categoryName,
  });
}

export function useGetLeaderboard(categoryName: CategoryName | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard", categoryName],
    queryFn: async () => {
      if (!actor || !categoryName) return [];
      return actor.getLeaderboard(categoryName);
    },
    enabled: !!actor && !isFetching && !!categoryName,
  });
}

export function useSubmitPuzzleTime() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      categoryName,
      timeTaken,
    }: {
      categoryName: CategoryName;
      timeTaken: bigint;
    }) => {
      if (!actor) return;
      await actor.submitPuzzleTime(categoryName, timeTaken);
    },
    onSuccess: (_, { categoryName }) => {
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", categoryName],
      });
    },
  });
}

export function useInitBackend() {
  const { actor } = useActor();
  return useQuery({
    queryKey: ["init"],
    queryFn: async () => {
      if (!actor) return null;
      await actor.init();
      return true;
    },
    enabled: !!actor,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}
