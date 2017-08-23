import React  from "react"
import Moment from "moment"

export default function Time({ moment, format="HH:mm", ...rest }) {
    return <span {...rest}>{ Moment(moment).format(format) }</span>;
}

Time.propTypes = {
    format: React.PropTypes.string,
    moment: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.instanceOf(Date),
        React.PropTypes.object // moment
    ]).isRequired
};