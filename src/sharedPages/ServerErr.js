import React from 'react'
import {Link} from "react-router-dom"
function ServerErrPage() {
    return (
        // <!-- Error Page Content -->
<div className="container">
    <div className="hero text-center my-4">
        <h1 className="display-5"><i className="bi bi-emoji-frown text-danger mx-3"></i></h1>
        <h1 className="display-5 fw-bold">500 Internal Server Error</h1>
        <p className="lead">The web server is returning an internal error for <em><span id="display-domain"></span></em>.
        </p>
        <p><button className="btn btn-outline-success btn-lg">Try This Page Again</button></p>
        <Link className="btn btn-danger" to="/" > الذهاب للرئيسية </Link>
    </div>

    {/* <div className="content">
        <div className="row  justify-content-center py-3">
            <div className="col-md-6">
                <div className="my-5 p-5 card">
                    <h3>What happened?</h3>
                    <p className="fs-5">A 500 error status implies there is a problem with the web server's software causing it to malfunction.</p>
                </div>
                <div className="my-5 p-5 card">
                    <h3>What can I do?</h3>
                    <p className="fs-4">If you're a site visitor</p>
                    <p>Nothing you can do at the moment. If you need immediate assistance, please send us an email instead. We apologize for any inconvenience.</p>
                    <p className="fs-4">If you're the site owner</p>
                    <p>This error can only be fixed by server admins, please contact your website provider.</p>
                </div>
            </div>
        </div>
    </div> */}
</div>
    )
}

export default ServerErrPage
