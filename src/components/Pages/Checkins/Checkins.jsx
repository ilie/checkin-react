import CheckinOptions from "./CheckinOptions";
import CheckinFilters, { emptyFilters, filtersToQuery } from "./CheckinFilters";
import CheckinToolbar from "./CheckinToolbar";
import CheckinHistory from "./CheckinHistory";
import Modal from "../../UI/Modal/Modal";
import useAxios from "../../../hooks/useAxios";
import AuthContext from "../../../store/auth-context";
import { toast } from "sonner";
import CheckinsTable from "../../Tables/CheckinsTable";
import CheckinList from "../../Lists/CheckinList";
import { useState, useContext } from "react";
import AdminOptions from "../../AdminOptions/AdminOptions";
import { apiErrorMessage, toApiSort } from "../../../helpers/api";
import { useAddCheckin, useCheckinHistory, useCheckins, useDeleteCheckin, useEditCheckin } from "../../../hooks/checkins";
import { useAllUsers } from "../../../hooks/users";
import { useIsPhone } from "../../../hooks/useIsPhone";

const exportPaths = {
  checkins: { path: "/checkins/export", name: "fichajes" },
  changes: { path: "/checkins/changes/export", name: "cambios-fichajes" },
};

// A stable empty list while the first page loads.
const noRows = [];

const titles = {
  phone: { admin: "All check-ins", worker: "Check-ins" },
  desktop: { admin: "All Checkins", worker: "My checkins" },
};

function Checkins() {
  const ctx = useContext(AuthContext);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
  const [sorting, setSorting] = useState([{ id: "checkin_date", desc: true }]);
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const { Axios } = useAxios();
  const isPhone = useIsPhone();

  const filterQuery = filtersToQuery(filters, ctx.isAdmin);
  // Phones list their own pages with "Show more"; this is the desktop table's page.
  const checkins = useCheckins(filterQuery, pagination.pageIndex + 1, pagination.pageSize, toApiSort(sorting), !isPhone);
  const users = useAllUsers(ctx.isAdmin);
  const history = useCheckinHistory(selectedRow, showHistory);
  const addCheckin = useAddCheckin();
  const editCheckin = useEditCheckin();
  const deleteCheckin = useDeleteCheckin();

  const data = checkins.data?.rows ?? noRows;
  const meta = checkins.data?.meta ?? {};
  const singleCheckin = data.find((row) => row.id === selectedRow) ?? {};
  const allUsers = users.data ?? [];

  function clearSelection() {
    setSelectedRow(null);
  }

  async function addCheckinHandler(newCheckinData) {
    try {
      await addCheckin.mutateAsync(newCheckinData);
      toast.success("Checkin added successfully");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function editCheckinHandler(checkin) {
    try {
      await editCheckin.mutateAsync({ id: selectedRow, checkin });
      clearSelection();
      toast.success("Checkin modified successfully!");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  async function deleteCheckinHandler() {
    const reason = window.prompt("Why are you deleting this check-in? The reason is kept in the change log.");
    if (!reason?.trim()) return;

    try {
      await deleteCheckin.mutateAsync({ id: selectedRow, reason: reason.trim() });
      clearSelection();
      toast.success("Checkin deleted!");
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  function filtersChangeHandler(newFilters) {
    setFilters(newFilters);
    goToFirstPage();
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
      // Safari can still be reading the file just after the click.
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch {
      toast.error("The export failed. Check the filters and try again.");
    }
  }

  function historyHandler() {
    setShowHistory(true);
  }

  function closeHistoryHandler() {
    setShowHistory(false);
  }

  // A selected row can't stay selected once it may be off screen, or Edit and Delete would act on it unseen.
  function changePagination(updater) {
    setPagination(updater);
    setSelectedRow(null);
  }

  function goToFirstPage() {
    changePagination((current) => ({ ...current, pageIndex: 0 }));
  }

  function sortingChangeHandler(updater) {
    setSorting(updater);
    goToFirstPage();
  }

  const title = titles[isPhone ? "phone" : "desktop"][ctx.isAdmin ? "admin" : "worker"];
  // Week totals need all of one person's rows: a worker's own, or an admin's filtered to one employee,
  // with no filter that leaves some of their work out.
  const showsOnePerson = !ctx.isAdmin || filters.user !== "";
  const showsAllWork = !filters.status && !filters.source && !filters.edited && !filters.showDeleted;
  const showTotals = showsOnePerson && showsAllWork;
  const hoursOnContract = ctx.isAdmin
    ? allUsers.find((user) => user.id === filters.user)?.hours_on_contract
    : ctx.user?.hoursOnContract;

  return (
    <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-4 px-4 py-7 max-md:gap-0 max-md:px-0 max-md:py-0 md:gap-5 md:px-8">
      <title>Check-ins · Checkin</title>
      <h1 className="text-mac-large font-bold text-label max-md:px-4 max-md:pt-1 max-md:pb-2 max-md:text-largetitle">
        {title}
      </h1>
      {isPhone ? (
        <>
          <CheckinToolbar
            filters={filters}
            onChange={filtersChangeHandler}
            users={allUsers}
            isAdmin={ctx.isAdmin}
            onExport={exportHandler}
          />
          <CheckinList
            filterQuery={filterQuery}
            from={filters.from}
            to={filters.to}
            showEmployee={ctx.isAdmin}
            showTotals={showTotals}
            hoursOnContract={hoursOnContract}
          />
        </>
      ) : (
        <>
          {ctx.isAdmin && (
            <AdminOptions>
              <CheckinOptions
                users={allUsers}
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
            users={allUsers}
            isAdmin={ctx.isAdmin}
            onExport={exportHandler}
            onHistory={historyHandler}
            canShowHistory={selectedRow !== null}
          />
          <CheckinsTable
            data={data}
            meta={meta}
            sorting={sorting}
            onSortingChange={sortingChangeHandler}
            pagination={pagination}
            onPaginationChange={changePagination}
            selectedRow={selectedRow}
            onSelect={setSelectedRow}
          />
          {/* On an error the query client shows a toast, so the dialog closes. */}
          {showHistory && !history.isError && (
            <Modal onClose={closeHistoryHandler} label="Change history" wide>
              <CheckinHistory changes={history.data ?? []} isLoading={history.isPending} onClose={closeHistoryHandler} />
            </Modal>
          )}
        </>
      )}
    </div>
  );
}

export default Checkins;
