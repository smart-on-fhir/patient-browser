import React from "react"
import { getErrorMessage } from "../../lib"
import Alert from "../Alert"

export default class ErrorMessage extends React.Component
{
    static propTypes = {
        error: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.object
        ])
    };

    static defaultProps = {
        error: "Unknown Error"
    };

    render() {
        return (
            <Alert type="danger">
                { getErrorMessage(this.props.error) }
            </Alert>
        )
    }
}