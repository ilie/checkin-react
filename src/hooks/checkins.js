import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deserialize } from "../helpers/jsonApi";
import { rememberStatus, rememberedStatus } from "../pwa/clockStatus";
import useAxios from "./useAxios";

// Every check-in query starts with "checkins", so one invalidation refreshes the list, the status and the history.
const checkinsKey = ["checkins"];

// One page of check-ins, with the screen's filters (a ready-made query string) after the paging and sort.
async function fetchCheckinPage(Axios, { pageSize, page, sort, filterQuery, signal }) {
  const filters = filterQuery ? `&${filterQuery}` : "";
  const response = await Axios.get(`/checkins?page[size]=${pageSize}&page[number]=${page}&sort=${sort}${filters}`, {
    signal,
  });

  return { rows: deserialize(response.data), meta: response.data.meta };
}

export function useCheckins(filterQuery, page, pageSize, sort, enabled = true) {
  const { Axios } = useAxios();

  return useQuery({
    queryKey: [...checkinsKey, "list", filterQuery, page, pageSize, sort],
    queryFn: ({ signal }) => fetchCheckinPage(Axios, { pageSize, page, sort, filterQuery, signal }),
    // Keep the current page on screen while the next one loads.
    placeholderData: keepPreviousData,
    enabled,
  });
}

// The phone's list: newest first, 50 rows at a time, for "Show more" instead of a pager.
export function useCheckinPages(filterQuery) {
  const { Axios } = useAxios();

  return useInfiniteQuery({
    queryKey: [...checkinsKey, "pages", filterQuery],
    queryFn: ({ pageParam, signal }) =>
      fetchCheckinPage(Axios, { pageSize: 50, page: pageParam, sort: "-checkin_date", filterQuery, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => (pages.length < lastPage.meta.last_page ? pages.length + 1 : undefined),
  });
}

// Refetches when the window regains focus (the default), so a second tab or phone shows the right button.
// Without a connection it falls back to the status remembered today, so the button shows and a tap can be queued:
// from the start when the phone says it's offline, and after the request fails when it says online but isn't.
export function useCheckinStatus() {
  const { Axios } = useAxios();

  return useQuery({
    queryKey: [...checkinsKey, "status"],
    async queryFn({ signal }) {
      try {
        const response = await Axios.get("/checkins/status", { signal });
        rememberStatus(response.data);

        return response.data;
      } catch (error) {
        const remembered = !error.response && !signal.aborted && rememberedStatus();
        if (remembered) return remembered;
        throw error;
      }
    },
    initialData: () => (navigator.onLine ? undefined : rememberedStatus()),
  });
}

export function useCheckinHistory(checkinId, enabled) {
  const { Axios } = useAxios();

  return useQuery({
    queryKey: [...checkinsKey, checkinId, "changes"],
    async queryFn({ signal }) {
      const response = await Axios.get(`/checkins/${checkinId}/changes`, { signal });

      return deserialize(response.data);
    },
    enabled,
  });
}

function useCheckinMutation(request) {
  const { Axios } = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => request(Axios, variables),
    // Returning the promise keeps the mutation pending until the data is fresh, so buttons don't flash stale state.
    onSettled: () => queryClient.invalidateQueries({ queryKey: checkinsKey }),
  });
}

export function useClock() {
  return useCheckinMutation((Axios, body) => Axios.post("/checkins", body));
}

export function useAddCheckin() {
  return useCheckinMutation((Axios, checkin) => Axios.post("/checkins/add", checkin));
}

export function useEditCheckin() {
  return useCheckinMutation((Axios, variables) => Axios.put(`/checkins/${variables.id}`, variables.checkin));
}

export function useDeleteCheckin() {
  return useCheckinMutation((Axios, variables) =>
    Axios.delete(`/checkins/${variables.id}`, { data: { reason: variables.reason } }),
  );
}
