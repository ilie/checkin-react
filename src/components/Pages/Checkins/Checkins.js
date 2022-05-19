import classes from "./Checkins.module.css";
import { deserialize } from "jsonapi-fractal";
import useAxios from "../../../hooks/useAxios";
import AuthContext from "../../../store/auth-context";
import { useState, useEffect, useContext } from "react";
import AdminOptions from "./AdminOptions";
import RecordsPerPage from "./RecordsPerPage";
import CheckinsTable from "./CheckinsTable";
import Pagination from "./Pagination";

function Checkins() {
  const ctx = useContext(AuthContext);
  const isAdmin = ctx.isAdmin;
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [sortDateAsc, setSortDateAsc] = useState(false);
  const [sortUserAsc, setSortUserAsc] = useState(true);
  const [sort, setSort] = useState(["-created_at", "user_id"]);
  const { Axios } = useAxios();

  let url = `/checkins?page[size]=${pageSize}&page[number]=${pageNumber}&sort=${sort}`;

  useEffect(() => {
    getData();
  }, [pageNumber, pageSize]);

  const getData = () => {
    setIsLoading(true);
    return Axios.get(url)
      .then((result) => {
        setIsLoading(false);
        setData(deserialize(result.data));
        setMeta(result.data.meta);
        console.log("URL ", url);
        //console.log("Data ", deserialize(result.data));
        console.log("Meta ", result.data.meta);
      })
      .catch((err) => {
        setIsLoading(false);
        //console.log(err);
      });
  };

  const perPageHandler = (e) => {
    setPageSize(e.target.value);
  };
  const previousPageHandler = () => {
    if(pageNumber <= 1) return;
    setPageNumber((prevState) => prevState -1);
    console.log(pageNumber);
  };
  const nextPageHandeler = () => {
    if(pageNumber >= meta.last_page) return ;
    setPageNumber((prevState) => prevState +1);
    console.log(pageNumber);
  };
  return (
    <div className="container">
      <div className={classes.body}>
        <h1>{isAdmin ? "All Checkins" : "My checkins"}</h1>
        {isAdmin && <AdminOptions />}
        <RecordsPerPage pageSize={pageSize} perPage={perPageHandler} />
        <CheckinsTable data={data} isLoading={isLoading} />
        <Pagination
          total={meta.total}
          from={meta.from}
          to={meta.to}
          previous={previousPageHandler}
          next={nextPageHandeler}
        />
      </div>
    </div>
  );
}

export default Checkins;
