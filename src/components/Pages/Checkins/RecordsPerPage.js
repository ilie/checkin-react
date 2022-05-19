import { Fragment } from "react";

function RecordsPerPage(props) {
    const selectOptions = [5,10,15,25,50,100];
    let defaultValue = ''
    const options = selectOptions.map(selectOption => {
        if(selectOption.value === props.pageSize){
            defaultValue = selectOption.value
        }
        return (
            <option key={selectOption} value={selectOption} defaultValue >{selectOption}</option>
        )
    })

  return (
    <Fragment>
      <span className="rows-per-page">Rows per page</span>
      <select
        name="Rows per page"
        value={props.pageSize}
        onChange={props.perPage}
      >
        {options}
      </select>
    </Fragment>
  );
}

export default RecordsPerPage;
