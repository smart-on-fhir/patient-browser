import React     from "react"
import PropTypes from "prop-types"
import Moment    from "moment"

export default function Time({ moment, format="HH:mm", ...rest }) {
    return <span {...rest}>{ Moment(moment).format(format) }</span>;
}

Time.propTypes = {
    format: PropTypes.string,
    moment: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
        PropTypes.object // moment
    ]).isRequired
};