import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import { useParams, Link, useNavigate } from "react-router-dom"
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import ReactMarkDown from 'react-markdown'
import { Tooltip as ReactTooltip } from "react-tooltip"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost() {
    const navigate = useNavigate()
    const appState = useContext(StateContext)
    const appDispatch = useContext(DispatchContext)
    const { id } = useParams()
    console.log('id', id)
    const [isLoading, setIsLoading] = useState(true)
    const [post, setPost] = useState()

    useEffect(() => {
        const ourRequest = Axios.CancelToken.source()
        async function fetchPost() {
            try {
                const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token })
                console.log(response.data)
                setPost(response.data)
                setIsLoading(false)
            } catch (e) {
                console.log("There was a problem or the request was canelled")
            }
        }
        fetchPost()
        return () => {
            ourRequest.cancel()
        }
    }, [id])

    if (!isLoading && !post) {
        return <NotFound/>
    }

    if (isLoading)
        return (
            <Page title="...">
                <LoadingDotsIcon />
            </Page>
        )

    const date = new Date(post.createdDate)
    const dateFormatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`

    function isOwner() {
        if (appState.loggedIn) {
            return appState.user.username == post.author.username
        }
        return false
    }

    async function deleteHandler() {
        const areYouSure = window.confirm("Do you really want to delete this post?")
        if (areYouSure) {
            try {
                const response = await Axios.delete(`/post/${id}`, {
                    data: {
                        token: appState.user.token
                    }
                })
                if (response.data == 'Success') {
                    //1. display a flash message
                    appDispatch({type: 'flashMessage', value: 'Post was successfully deleted'})

                    //2. redirect back to the current user's profile
                    navigate(`/profile/${appState.user.username}`)
                }
            } catch (e) {
                console.log('There was a problem')
            }
        }
    }

    return (
        <Page title={post.title}>
            <div className="d-flex justify-content-between">
                <h2>{post.title}</h2>
                {isOwner() && (
                    <span className="pt-2">
                        <Link to={`/post/${post._id}/edit`} data-tooltip-content="Edit" data-tooltip-id="edit" className="text-primary mr-2">
                            <i className="fas fa-edit"></i>
                        </Link>
                        <ReactTooltip id="edit" className="custom-tooltip"/>{" "}
                        <a onClick={deleteHandler} data-tooltip-content="Delete" data-tooltip-id="delete" className="delete-post-button text-danger">
                            <i className="fas fa-trash"></i>
                        </a>
                        <ReactTooltip id="delete" className="custom-tooltip"/>
                    </span>
                )}
            </div>

            <p className="text-muted small mb-4">
                <Link to={`/profile/${post.author.username}`}>
                    <img className="avatar-tiny" src={post.author.avatar} />
                </Link>
                Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
            </p>

            <div className="body-content">
                <ReactMarkDown children={post.body} allowedElement={[
                    'p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'
                ]} />
            </div>
        </Page>
    )
}

export default ViewSinglePost
