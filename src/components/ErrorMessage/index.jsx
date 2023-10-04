import React               from "react"
import PropTypes           from "prop-types"
import { getErrorMessage } from "../../lib"
import Alert               from "../Alert"

export default class ErrorMessage extends React.Component
{
    static propTypes = {
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
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