import React       from "react"
import { getPath } from "../../lib"
import moment      from "moment"

export default function Period(rec) {
    let from = getPath(rec, "period.start") || "";
    let to   = getPath(rec, "period.end"  ) || "";

    if (from && to) {
        from = moment(from);
        to = moment(to);

        if (from.isSame(to, "day")) {
            return (
                <div>
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
                </div>
            )
        }
        else {
            return (
                <div>
                    <small className="text-muted"> from </small>
                    { from.format("MM/DD/YYYY") }
                    <small className="text-muted"> to </small>
                    { to.format("MM/DD/YYYY") }
                </div>
            )
        }
    }
    else {
        if (from) {
            from = moment(from);
            return (
                <div>
                    <small className="text-muted"> from </small>
                    { from.format("MM/DD/YYYY") }
                </div>
            )
        }
        else if (to) {
            to = moment(to);
            return (
                <div>
                    <small className="text-muted"> to </small>
                    { to.format("MM/DD/YYYY") }
                </div>
            )
        }
    }
    return <small className="text-muted">N/A</small>
}