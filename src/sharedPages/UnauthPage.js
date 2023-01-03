import React from 'react'
import { Link } from 'react-router-dom'
import './style.css'
function UnauthPage() {
  return (
<div className='un-auth-page'>
<div className="message text-center">
<div className="">
<i className="fas fa-user-lock fa-5x"></i>
</div>
  <h1>عذراً ليس لديك صلاحية لهذه الصفحة</h1>
  <Link to="/" className='btn btn-danger'>الذهاب للرئيسية </Link>
</div>
</div>
  )
}

export default UnauthPage