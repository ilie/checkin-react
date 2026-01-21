import { Fragment } from "react";

function RecordsPerPage(props) {
  const selectOptions = [5, 10, 15, 25, 50, 100];
  const options = selectOptions.map((selectOption) => {
    return (
      <option key={selectOption} value={selectOption} defaultValue>
        {selectOption}
      </option>
    );
  });

  return (
    <Fragment>
      <span className="rows-per-page">Rows per page</span>
      <label className="custom-selector-sm">
        <select
          className="select_perPage"
          name="select_perPage"
          value={props.pageSize}
          onChange={props.perPage}
        >
          {options}
        </select>
      </label>
    </Fragment>
  );
}

export default RecordsPerPage;
