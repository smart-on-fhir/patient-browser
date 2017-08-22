import React       from "react"
import Grid        from "./Grid"
import { getPath } from "../../lib"
import Period      from "./Period"

export default class Encounter extends React.Component
{
    static propTypes = {
        resources: React.PropTypes.arrayOf(React.PropTypes.object)
    };

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title={ `Encounter${this.props.resources.length === 1 ? "" : "s"}` }
                cols={[
                    {
                        label : "Type",
                        render: rec => <b>{ getPath(rec, "type.0.text") }</b>
                    },
                    {
                        label: "Reason",
                        path : "reason.0.coding.0.display",
                        defaultValue: "N/A"
                    },
                    {
                        label: "Class",
                        path : "class.code",
                        defaultValue: "N/A"
                    },
                    {
                        label: "Status",
                        path : "status",
                        defaultValue: "N/A"
                    },
                    {
                        label: "Time",
                        render: Period
                    }
                ]}
            />
        )
    }
}

