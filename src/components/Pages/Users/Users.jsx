import UsersTable from "../../Tables/UsersTable";
import UserList from "../../Lists/UserList";
import AuthContext from "../../../store/auth-context";
import { toast } from "sonner";
import { useState, useContext } from "react";
import AdminOptions from "../../AdminOptions/AdminOptions";
import UserOptions from "./UserOptions";
import { apiErrorMessage, toApiSort } from "../../../helpers/api";
import { useAddUser, useDeleteUser, useEditUser, useUsers } from "../../../hooks/users";
import { useIsPhone } from "../../../hooks/useIsPhone";

// A stable empty list while the first page loads.
const noRows = [];

function Users() {
  const authCtx = useContext(AuthContext);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([{ id: "name", desc: false }]);
  const [selectedRow, setSelectedRow] = useState(null);
  const isPhone = useIsPhone();
  // Phones list every user at once; this is the desktop table's page.
  const users = useUsers(pagination.pageIndex + 1, pagination.pageSize, toApiSort(sorting), !isPhone);
  const addUser = useAddUser();
  const editUser = useEditUser();
  const deleteUser = useDeleteUser();

  const rows = users.data?.rows ?? noRows;
  const meta = users.data?.meta ?? {};
  // The list already has every field the form needs.
  const singleUser = rows.find((row) => row.id === selectedRow) ?? {};

  async function addUserHandler(newUserData) {
    try {
      await addUser.mutateAsync(newUserData);
      toast.success("User added succesfuly");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function editUserHandler(user) {
    try {
      await editUser.mutateAsync({ id: selectedRow, user });
      setSelectedRow(null);
      toast.success("User modified succesfuly!");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function deleteUserHandler() {
    if (!window.confirm(`Delete ${singleUser.name}? They'll be signed out straight away.`)) return;
    try {
      await deleteUser.mutateAsync(selectedRow);
      setSelectedRow(null);
      toast.success("User deleted!");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  // A selected row can't stay selected once it may be off screen, or Modify and Delete would act on it unseen.
  function changePagination(updater) {
    setPagination(updater);
    setSelectedRow(null);
  }

  function sortingChangeHandler(updater) {
    setSorting(updater);
    changePagination((current) => ({ ...current, pageIndex: 0 }));
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 max-md:gap-0 max-md:px-0 max-md:py-0 md:px-6">
      <title>Users · Checkin</title>
      <h1 className="text-3xl font-bold text-gray-900 max-md:px-4 max-md:pt-1 max-md:pb-2 max-md:text-largetitle max-md:text-label">
        Users
      </h1>
      {isPhone ? (
        <UserList />
      ) : (
        <>
          {authCtx.isAdmin && (
            <AdminOptions>
              <UserOptions
                onAdd={addUserHandler}
                onEdit={editUserHandler}
                onDelete={deleteUserHandler}
                selectedRow={selectedRow}
                singleUser={singleUser}
                setSelectedRow={setSelectedRow}
              />
            </AdminOptions>
          )}
          <UsersTable
            data={rows}
            meta={meta}
            sorting={sorting}
            onSortingChange={sortingChangeHandler}
            pagination={pagination}
            onPaginationChange={changePagination}
            selectedRow={selectedRow}
            onSelect={setSelectedRow}
          />
        </>
      )}
    </div>
  );
}

export default Users;
