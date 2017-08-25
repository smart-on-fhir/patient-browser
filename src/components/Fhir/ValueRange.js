import React     from "react"
import PropTypes from "prop-types"

export default function ValueRange({ range }) {
    let low = range.low;
    let high = range.high;
    return (
        <span>
            {
                low !== undefined &&
                <span>
                    <span className="text-muted">low: </span>
                    <span>{ low }</span>
                </span>
            }
            {
                high !== undefined &&
                <span>
                    { low !== undefined && <span>&nbsp;</span> }
                    <span className="text-muted">high: </span>
                    <span>{ high }</span>
                </span>
            }
            {
                high === undefined  && low === undefined &&
                <small className="text-muted">N/A</small>
            }
        </span>
    );
}

ValueRange.propTypes = {
    range: PropTypes.object.isRequired
};