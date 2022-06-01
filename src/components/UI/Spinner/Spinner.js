import classes from './Spinner.module.css';

// This is a very cool resource from: https://projects.lukehaas.me/css-loaders/

const spinner = () =>(
    <div className={classes.loader}>Loading...</div>
);

export default spinner;