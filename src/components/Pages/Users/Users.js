import classes from "./Users.module.css";
import { deserialize } from "jsonapi-fractal";
import useAxios from "../../../hooks/useAxios";
import UsersTable from "../../Tables/UsersTable";
import Pagination from "../../Tables/Pagination";
import AuthContext from "../../../store/auth-context";
import { ToastContainer, toast } from "react-toastify";
import { useEffect, useState, useContext } from "react";
import RecordsPerPage from "../../Tables/RecordsPerPage";
import AdminOptions from "../../AdminOptions/AdminOptions";
import UserOptions from "./UserOptions";

function Users() {
  const { Axios } = useAxios();
  const authCtx = useContext(AuthContext);
  const [meta, setMeta] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const [singleUser, setSingleUser] = useState({});

  let url = `/users?page[size]=${pageSize}&page[number]=${pageNumber}&sort=name`;

  useEffect(() => {
    getUsers();
  }, [pageNumber, pageSize]);

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const response = await Axios.get(url);
      setUsers(deserialize(response.data));
      setMeta(response.data.meta);
      setIsLoading(false);
    } catch (err) {
      if (err.response.status === 401) authCtx.clearLoginData();
      setIsLoading(false);
    }
  };

  const selectRowHandler = async (row) => {
    const response = await Axios.get(`users/${row}`);
    setSingleUser(deserialize(response.data));
    setSelectedRow(row);
  };

  const addUserHandler = async (newUserData) => {
    const response = await Axios.post("/users/register", newUserData);
    const addedUser = deserialize(response.data);
    const newUsers = [addedUser, ...users];
    const newTotal = meta.total + 1;
    const newMeta = { ...meta, total: newTotal };
    setMeta(newMeta);
    setUsers(newUsers);
    toast.success("User added succesfuly");
  };

  const editUserHandler = async (user) => {
    try {
      const response = await Axios.put(`/users/${selectedRow}`, user);
      const modifiedUser = deserialize(response.data);
      const modifiedUsers = users.map((item) => {
        return item.id === selectedRow ? modifiedUser : item;
      });
      setUsers(modifiedUsers);
      setSelectedRow(null);
      setSingleUser({});
      toast.success("User modified succesfuly!");
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  const deleteUserHandler = async () => {
    try {
      await Axios.delete(`users/${selectedRow}`);
      const newUsers = users.filter((row) => row.id !== selectedRow);
      const newTotal = meta.total - 1;
      const newMeta = { ...meta, total: newTotal };
      setUsers(newUsers);
      setMeta(newMeta);
      toast.success("User deleted!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const perPageHandler = (e) => {
    setPageSize(e.target.value);
  };

  const previousPageHandler = () => {
    if (pageNumber <= 1) return;
    setPageNumber((prevState) => prevState - 1);
  };

  const nextPageHandeler = () => {
    if (pageNumber >= meta.last_page) return;
    setPageNumber((prevState) => prevState + 1);
  };

  return (
    <div className="container">
      <div className={classes.body}>
        <h1>Users</h1>
        <ToastContainer style={{ top: "6rem", right: "0.4rem" }} />
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
        <RecordsPerPage pageSize={pageSize} perPage={perPageHandler} />
        <UsersTable
          users={users}
          onSelect={selectRowHandler}
          selectedRow={selectedRow}
        />
        <Pagination
          currentPage={meta.current_page}
          previous={previousPageHandler}
          next={nextPageHandeler}
          from={meta.from}
          lastPage={meta.last_page}
          perPage={meta.per_page}
          to={meta.to}
          total={meta.total}
        />
      </div>
    </div>
  );
}

export default Users;
