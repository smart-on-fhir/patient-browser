import React from "react"
import "./Loader.less"

export default class Loader extends React.Component
{
    render() {
        return (
            <div className="loader">
                <div>
                    <i className="fa fa-spinner spin" /> Loading...
                </div>
            </div>
        )
    }
}