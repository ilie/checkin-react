import classes from './Paginiation.module.css'

function Pagination(props) {
  return (
    <div className={classes.pagination}>
        <div className={classes.total}>Showing {props.from} to {props.to} of {props.total} entries</div>
        <div className={classes.buttons}>
            <span active={props.active} onClick={props.previous}>Previous</span>
            <span active={props.active} onClick={props.next}>Next</span>
        </div>
    </div>
  )
}

export default Pagination