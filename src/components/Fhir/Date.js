import React  from "react"
import Moment from "moment"

export default function Date({ moment, format="MM/DD/YYYY", ...rest }) {
    return <span {...rest}>{ Moment(moment).format(format) }</span>;
}

Date.propTypes = {
    format: React.PropTypes.string,
    moment: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.instanceOf(Date),
        React.PropTypes.object // moment
    ]).isRequired
};