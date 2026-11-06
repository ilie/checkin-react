import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deserialize } from "../helpers/jsonApi";
import useAxios from "./useAxios";

const usersKey = ["users"];

export function useUsers(page, pageSize, sort, enabled = true) {
  const { Axios } = useAxios();

  return useQuery({
    queryKey: [...usersKey, "list", page, pageSize, sort],
    async queryFn({ signal }) {
      const response = await Axios.get(`/users?page[size]=${pageSize}&page[number]=${page}&sort=${sort}`, { signal });

      return { rows: deserialize(response.data), meta: response.data.meta };
    },
    placeholderData: keepPreviousData,
    enabled,
  });
}

// Every user, for the admin's employee pickers. The API caps a page at 1000 rows.
export function useAllUsers(enabled) {
  const { Axios } = useAxios();

  return useQuery({
    queryKey: [...usersKey, "all"],
    async queryFn({ signal }) {
      const response = await Axios.get("/users?page[size]=1000&sort=name", { signal });

      return deserialize(response.data);
    },
    enabled,
    meta: { adminOnly: true },
  });
}

function useUserMutation(request) {
  const { Axios } = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables) => request(Axios, variables),
    // Check-in rows show the user's name, so they go stale too.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKey }),
        queryClient.invalidateQueries({ queryKey: ["checkins"] }),
      ]),
  });
}

export function useAddUser() {
  return useUserMutation((Axios, user) => Axios.post("/users/register", user));
}

export function useEditUser() {
  return useUserMutation((Axios, variables) => Axios.put(`/users/${variables.id}`, variables.user));
}

export function useDeleteUser() {
  return useUserMutation((Axios, id) => Axios.delete(`/users/${id}`));
}
