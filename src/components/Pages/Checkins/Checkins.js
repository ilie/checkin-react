import { Fragment } from "react";
import Modal from "../../UI/Modal/Modal";
import AdminOptions from "./AdminOptions";
import CheckinsTable from "./CheckinsTable";
import classes from "./Checkins.module.css";
import Pagination from "../../UI/Pagination";
import { deserialize } from "jsonapi-fractal";
import RecordsPerPage from "./RecordsPerPage";
import useAxios from "../../../hooks/useAxios";
import AuthContext from "../../../store/auth-context";
import { ToastContainer, toast } from "react-toastify";
import { useState, useEffect, useContext } from "react";
import CheckinForm from "../../Forms/CheckinForm";

function Checkins() {
  const ctx = useContext(AuthContext);
  const isAdmin = ctx.isAdmin;
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [selctedUserValue, setSelectedUserValue] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("");
  const { Axios } = useAxios();

  let url = `/checkins?page[size]=${pageSize}&page[number]=${pageNumber}&sort=-created_at${filter}`;

  useEffect(() => {
    getData();
    getUsers();
  }, [pageNumber, pageSize, filter]);

  // Methods
  const closeModal = () => {
    setShowModal(false);
  };

  const getData = () => {
    setIsLoading(true);
    return Axios.get(url)
      .then((result) => {
        setIsLoading(false);
        setData(deserialize(result.data));
        setMeta(result.data.meta);
      })
      .catch(() => {
        setIsLoading(false);
      });
  };

  const addCheckin = async (newCheckin) => {
    try {
      const response = await Axios.post("/checkins/add", newCheckin);
      const addedCheckin = deserialize(response.data);
      const checkins = [addedCheckin, ...data];
      setData(checkins);
      closeModal();
      toast.success("Checkin addes succesfuly");
    } catch (error) {
      closeModal();
      console.log(error);
      toast.error("error");
    }
  };

  // Handlers
  const hideModalHandler = () => {
    closeModal();
  };

  const showModalHandler = () => {
    setShowModal(true);
  }
  const addCheckinHandler = (newCheckinData) => {
    addCheckin(newCheckinData);
  };

  const getUsers = () => {
    return Axios.get("/users").then((result) => {
      const data = deserialize(result.data);
      setUsers(data);
    });
  };

  const selectOnChangeHandler = (e) => {
    setSelectedUserValue(e.target.value);
    const filter = e.target.value === 0 ? "" : "&filter[user]=" + e.target.value;
    setFilter(filter);
  };

  const perPageHandler = (e) => {
    setPageSize(e.target.value);
  };
  const previousPageHandler = () => {
    if (pageNumber <= 1) return;
    setPageNumber((prevState) => prevState - 1);
    console.log(pageNumber);
  };
  const nextPageHandeler = () => {
    if (pageNumber >= meta.last_page) return;
    setPageNumber((prevState) => prevState + 1);
    console.log(pageNumber);
  };
  return (
    <div className="container">
      <div className={classes.body}>
        <h1>{isAdmin ? "All Checkins" : "My checkins"}</h1>
        {isAdmin && (
          <Fragment>
            <AdminOptions
              users={users}
              selectOnChange={selectOnChangeHandler}
              selectedUser={selctedUserValue}
              onClickCreate={showModalHandler}
            />

            <Modal showModal={showModal}>
              <CheckinForm
                users={users}
                onAddCheckin={addCheckinHandler}
                onCancel={hideModalHandler}
              />
            </Modal>
          </Fragment>
        )}
        <ToastContainer style={{ top: "6rem", right: "0.4rem" }} />
        <RecordsPerPage pageSize={pageSize} perPage={perPageHandler} />
        <CheckinsTable data={data} isLoading={isLoading} />
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
