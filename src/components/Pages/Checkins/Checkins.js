import CheckinsTable from "../../Tables/CheckinsTable";
import classes from "./Checkins.module.css";
import { deserialize } from "jsonapi-fractal";
import CheckinOptions from "./CheckinOptions";
import useAxios from "../../../hooks/useAxios";
import Pagination from "../../Tables/Pagination";
import AuthContext from "../../../store/auth-context";
import { ToastContainer, toast } from "react-toastify";
import { useState, useEffect, useContext } from "react";
import RecordsPerPage from "../../Tables/RecordsPerPage";
import AdminOptions from "../../AdminOptions/AdminOptions";

function Checkins() {
  const ctx = useContext(AuthContext);
  const isAdmin = ctx.isAdmin;
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [filter, setFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [singleCheckin, setSingleCheckin] = useState({});
  const { Axios } = useAxios();

  let url = `/checkins?page[size]=${pageSize}&page[number]=${pageNumber}&sort=-checkin_date${filter}`;

  useEffect(() => {
    getData();
    getUsers();
  }, [pageNumber, pageSize, filter]);

  const getData = async () => {
    setIsLoading(true);
    try {
      const response = await Axios.get(url);
      setData(deserialize(response.data));
      setMeta(response.data.meta);
      setIsLoading(false);
    } catch (err) {
      if (err.response.status === 401) ctx.clearLoginData();
      setIsLoading(false);
    }
  };

  const getUsers = async () => {
    const response = await Axios.get("/users");
    setUsers(deserialize(response.data));
  };

  const addCheckinHandler = async (newCheckinData) => {
    try {
      const response = await Axios.post("/checkins/add", newCheckinData);
      const addedCheckin = deserialize(response.data);
      const checkins = [addedCheckin, ...data];
      const newTotal = meta.total + 1;
      const newMeta = { ...meta, total: newTotal };
      setMeta(newMeta);
      setData(checkins);
      toast.success("Checkin added succesfuly");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const editCheckinHandler = async (checkin) => {
    try {
      const response = await Axios.put(`/checkins/${selectedRow}`, checkin);
      const modifiedCheckin = deserialize(response.data);
      const modifiedCheckins = data.map((item) => {
        return item.id === checkin.id ? modifiedCheckin : item;
      });
      setData(modifiedCheckins);
      setSelectedRow(null);
      setSingleCheckin({});
      toast.success("Checkin modified succesfuly!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteCheckinHandler = async () => {
    try {
      await Axios.delete(`checkins/${selectedRow}`);
      const newCheckins = data.filter((row) => row.id !== selectedRow);
      const newTotal = meta.total - 1;
      const newMeta = { ...meta, total: newTotal };
      setData(newCheckins);
      setMeta(newMeta);
      toast.success("Checkin deleted!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filterHandler = (user) => {
    const filter = user === "0" ? "" : "&filter[user]=" + user;
    setFilter(filter);
  };

  const selectRowHandler = async (row) => {
    const response = await Axios.get(`checkins/${row}`);
    setSingleCheckin(deserialize(response.data));
    setSelectedRow(row);
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
        <h1>{isAdmin ? "All Checkins" : "My checkins"}</h1>
        {isAdmin && (
          <AdminOptions>
            <CheckinOptions
              users={users}
              onFilter={filterHandler}
              onAdd={addCheckinHandler}
              onEdit={editCheckinHandler}
              onDelete={deleteCheckinHandler}
              selectedRow={selectedRow}
              singleCheckin={singleCheckin}
            />
          </AdminOptions>
        )}
        <ToastContainer style={{ top: "6rem", right: "0.4rem" }} />
        <RecordsPerPage pageSize={pageSize} perPage={perPageHandler} />
        <CheckinsTable
          data={data}
          isLoading={isLoading}
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

export default Checkins;
