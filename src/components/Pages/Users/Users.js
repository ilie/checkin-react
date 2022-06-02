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

function Users() {
  const { Axios } = useAxios();
  const authCtx = useContext(AuthContext);
  const [meta, setMeta] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [singleUser, setSingleUser] = useState({});
  let url = `/users?page[size]=${pageSize}&page[number]=${pageNumber}&sort=name${filter}`;

  useEffect(() => {
    getUsers();
  }, [pageNumber, pageSize, filter]);

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
        <AdminOptions>aa</AdminOptions>
        <RecordsPerPage pageSize={pageSize} perPage={perPageHandler} />
        <UsersTable users={users} />
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
