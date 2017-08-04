import React       from "react"
import moment      from "moment"
import Grid        from "./Grid"
import { getPath } from "../../lib"

export default class CarePlan extends React.Component
{
    static propTypes = {
        resources: React.PropTypes.arrayOf(React.PropTypes.object)
    };

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title="CarePlan"
                cols={[
                    {
                        label: "Category",
                        render: rec => (
                            <b>
                                { getPath(rec, "category.0.coding.0.display") }
                            </b>
                        )
                    },
                    {
                        label: "Reason",
                        render: rec => (rec.activity || []).map((a, i) => {
                            let reason = getPath(a, "detail.code.coding.0.display") || ""
                            return reason ? (
                                <div key={i}>
                                    { reason }
                                    <span> - </span>
                                    <span className="text-muted">{
                                        getPath(a, "detail.status") || "no data"
                                    }</span>
                                </div>
                            ) : ""
                        })
                    },
                    {
                        label: "Period",
                        render: rec => {
                            let from = getPath(rec, "period.start") || ""
                            let to   = getPath(rec, "period.end"  ) || ""

                            if (from) from = moment(from).format("MM/DD/YYYY")
                            if (to) to = moment(to).format("MM/DD/YYYY")
                            return (
                                <span>
                                    {
                                        from ?
                                        <span>
                                            <small className="text-muted">from </small>
                                            { from }
                                        </span> :
                                        null
                                    }
                                    {
                                        to ?
                                        <span>
                                            <small className="text-muted"> to </small>
                                            { to }
                                        </span> :
                                        null
                                    }
                                </span>
                            )
                        }
                    },
                    {
                        label: "Status",
                        path : "status"
                    }
                ]}
            />
        )
    }
}

