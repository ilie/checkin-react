import React from 'react'
import classes from './AdminOptions.module.css';

function AdminOptions() {
  return (
    <div className={classes.options}>
        <span className={classes.create}>Create New Checkin</span>
        <span className={classes.remove}>Remove Checkin</span>
        <span className={classes.edit}>Checkin</span>
    </div>
  )
}

export default AdminOptions