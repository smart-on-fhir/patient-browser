import React  from "react"
import moment from "moment"

export default function Period(period) {
    let from = period.start || "";
    let to   = period.end   || "";

    if (from && to) {
        from = moment(from);
        to = moment(to);

        if (from.isSame(to, "day")) {
            return (
                <span>
                    {
                        from.format("MM/DD/YYYY")
                    }
                    {   from.isSame(to, "hour") ?
                        null :
                        <span>
                            <small className="text-muted"> from </small>
                            { from.format("HH:mm") }
                            <small className="text-muted"> to </small>
                            { to.format("HH:mm") }
                        </span>
                    }
                </span>
            )
        }
        else {
            return (
                <span>
                    <small className="text-muted"> from </small>
                    { from.format("MM/DD/YYYY") }
                    <small className="text-muted"> to </small>
                    { to.format("MM/DD/YYYY") }
                </span>
            )
        }
    }
    else {
        if (from) {
            from = moment(from);
            return (
                <span>
                    <small className="text-muted"> from </small>
                    { from.format("MM/DD/YYYY") }
                </span>
            )
        }
        else if (to) {
            to = moment(to);
            return (
                <span>
                    <small className="text-muted"> to </small>
                    { to.format("MM/DD/YYYY") }
                </span>
            )
        }
    }
    return <small className="text-muted">N/A</small>
}