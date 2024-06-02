import React from "react"
import Page from "./Page"
import { Link } from "react-router-dom"

function NotFound() {
  return (
    <Page title= "Not Found">
        <div className="text-center">
            <h2>Woops, we cannot find that Page</h2>
        </div>
        <p className="lead text-muted text-center">You can always visit the <Link to={'/'}>homepage</Link> to get a fresh start.</p>
    </Page>
  )
}

export default NotFound