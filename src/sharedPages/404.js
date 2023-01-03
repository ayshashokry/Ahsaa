import React from 'react'
import { Link } from 'react-router-dom'

function NotFoundPage404() {
  return (
    <div className='container' style={{textAlign:'center'}}>
        <div>

        <h1 style={{color:'darkred', marginTop:'3em'}}>
        404 Page Not Found 
        </h1>
        </div>
        <div>

        <Link to="/" className='btn btn-danger m-3'>اذهب للرئيسية</Link>
        </div>
    </div>
  )
}

export default NotFoundPage404