import { deserialize } from "jsonapi-fractal";
import CheckinOptions from "./CheckinOptions";
import CheckinFilters, { emptyFilters, filtersToQuery } from "./CheckinFilters";
import CheckinHistory from "./CheckinHistory";
import Modal from "../../UI/Modal/Modal";
import useAxios from "../../../hooks/useAxios";
import Pagination from "../../Tables/Pagination";
import AuthContext from "../../../store/auth-context";
import { ToastContainer, toast } from "react-toastify";
import CheckinsTable from "../../Tables/CheckinsTable";
import { useState, useEffect, useContext } from "react";
import RecordsPerPage from "../../Tables/RecordsPerPage";
import AdminOptions from "../../AdminOptions/AdminOptions";
import { apiErrorMessage } from "../../../helpers/api";

const exportPaths = {
  checkins: { path: "/checkins/export", name: "fichajes" },
  changes: { path: "/checkins/changes/export", name: "cambios-fichajes" },
};

function Checkins() {
  const ctx = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(15);
  const [pageNumber, setPageNumber] = useState(1);
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedRow, setSelectedRow] = useState(null);
  const [singleCheckin, setSingleCheckin] = useState({});
  const [history, setHistory] = useState({ show: false, isLoading: false, changes: [] });
  const { Axios } = useAxios();

  const filterQuery = filtersToQuery(filters, ctx.isAdmin);
  const url = `/checkins?page[size]=${pageSize}&page[number]=${pageNumber}&sort=-checkin_date${filterQuery ? `&${filterQuery}` : ""}`;

  async function getData() {
    setIsLoading(true);
    try {
      const response = await Axios.get(url);
      setData(deserialize(response.data));
      setMeta(response.data.meta);
    } catch (error) {
      if (error.response?.status === 401) ctx.clearLoginData();
      toast.error(apiErrorMessage(error));
    }
    setIsLoading(false);
  }

  async function getUsers() {
    try {
      if (ctx.isAdmin) {
        const response = await Axios.get("/users?page[size]=9999&sort=name");
        setUsers(deserialize(response.data));
      }
    } catch (error) {
      if (error.response?.status === 403) ctx.setAdminFalse();
    }
  }

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, filterQuery]);

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearSelection() {
    setSelectedRow(null);
    setSingleCheckin({});
  }

  async function addCheckinHandler(newCheckinData) {
    try {
      await Axios.post("/checkins/add", newCheckinData);
      toast.success("Checkin added successfully");
      getData();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function editCheckinHandler(checkin) {
    try {
      await Axios.put(`/checkins/${selectedRow}`, checkin);
      clearSelection();
      toast.success("Checkin modified successfully!");
      getData();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function deleteCheckinHandler() {
    const reason = window.prompt("Why are you deleting this check-in? The reason is kept in the change log.");
    if (!reason?.trim()) return;

    try {
      await Axios.delete(`/checkins/${selectedRow}`, { data: { reason: reason.trim() } });
      clearSelection();
      toast.success("Checkin deleted!");
      getData();
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  function filtersChangeHandler(newFilters) {
    setFilters(newFilters);
    setPageNumber(1);
    clearSelection();
  }

  // The API needs the bearer token, so the file is downloaded through Axios and handed to the browser.
  async function exportHandler(type) {
    const { path, name } = exportPaths[type];

    try {
      const response = await Axios.get(`${path}${filterQuery ? `?${filterQuery}` : ""}`, { responseType: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(response.data);
      link.download = `${name}_${filters.from || "inicio"}_${filters.to || new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      toast.error("The export failed. Check the filters and try again.");
    }
  }

  async function historyHandler() {
    setHistory({ show: true, isLoading: true, changes: [] });
    try {
      const response = await Axios.get(`/checkins/${selectedRow}/changes`);
      setHistory({ show: true, isLoading: false, changes: deserialize(response.data) });
    } catch (error) {
      setHistory({ show: false, isLoading: false, changes: [] });
      toast.error(apiErrorMessage(error));
    }
  }

  function closeHistoryHandler() {
    setHistory({ show: false, isLoading: false, changes: [] });
  }

  function selectRowHandler(rowId) {
    setSelectedRow(rowId);
    setSingleCheckin(data.find((row) => row.id === rowId) ?? {});
  }

  function perPageHandler(event) {
    setPageSize(event.target.value);
    setPageNumber(1);
  }

  function previousPageHandler() {
    if (pageNumber <= 1) return;
    setPageNumber((prevState) => prevState - 1);
  }

  function nextPageHandler() {
    if (pageNumber >= meta.last_page) return;
    setPageNumber((prevState) => prevState + 1);
  }

  return (
    <div className="container">
      <div className="body">
        <h1>{ctx.isAdmin ? "All Checkins" : "My checkins"}</h1>
        {ctx.isAdmin && (
          <AdminOptions>
            <CheckinOptions
              users={users}
              onAdd={addCheckinHandler}
              onEdit={editCheckinHandler}
              onDelete={deleteCheckinHandler}
              selectedRow={selectedRow}
              singleCheckin={singleCheckin}
            />
          </AdminOptions>
        )}
        <CheckinFilters
          filters={filters}
          onChange={filtersChangeHandler}
          users={users}
          isAdmin={ctx.isAdmin}
          onExport={exportHandler}
          onHistory={historyHandler}
          canShowHistory={selectedRow !== null}
        />
        <ToastContainer style={{ top: "6rem", right: "0.4rem" }} />
        <RecordsPerPage pageSize={pageSize} perPage={perPageHandler} />
        <CheckinsTable data={data} isLoading={isLoading} onSelect={selectRowHandler} selectedRow={selectedRow} />
        <Pagination
          currentPage={meta.current_page}
          previous={previousPageHandler}
          next={nextPageHandler}
          from={meta.from}
          lastPage={meta.last_page}
          perPage={meta.per_page}
          to={meta.to}
          total={meta.total}
        />
        <Modal showModal={history.show} click={closeHistoryHandler}>
          {history.show && (
            <CheckinHistory changes={history.changes} isLoading={history.isLoading} onClose={closeHistoryHandler} />
          )}
        </Modal>
      </div>
    </div>
  );
}

export default Checkins;
