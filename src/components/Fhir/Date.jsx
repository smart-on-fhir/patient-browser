import React     from "react"
import PropTypes from "prop-types"
import Moment    from "moment"

export default function Date({ moment, format="MM/DD/YYYY", ...rest }) {
    return <span {...rest}>{ Moment(moment).format(format) }</span>;
}

Date.propTypes = {
    format: PropTypes.string,
    moment: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
        PropTypes.object // moment
    ]).isRequired
};