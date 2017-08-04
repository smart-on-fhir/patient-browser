import React from "react"
import Grid  from "./Grid"

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
                        label: "Type",
                        path : "type.0.text"
                    },
                    {
                        label: "Reason",
                        path : "reason.0.coding.0.display"
                    },
                    {
                        label: "Class",
                        path : "class.code"
                    }
                ]}
            />
        )
    }
}

