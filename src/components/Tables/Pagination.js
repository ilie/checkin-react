function Pagination(props) {
  const firstLinkDisabled = props.currentPage === 1 ? 'disabled' : '';
  const lastLinkDisabled = props.currentPage === props.lastPage ? 'disabled' : '';
  return (
    <div className="Pagination">
      <div className="Pagination__total">
        <span className="Pagination__buttons--current_page">Page {props.currentPage} / {props.lastPage}</span>
        <span className="hide_on_mobile">Showing {props.from} to {props.to} of {props.total} entries</span>
      </div>
      <div className="Pagination__buttons">
        <span className={firstLinkDisabled} onClick={props.previous}>
          &laquo; Previous
        </span>
        <span className={lastLinkDisabled} onClick={props.next}>
          Next &raquo;
        </span>
      </div>
    </div>
  );
}

export default Pagination;
