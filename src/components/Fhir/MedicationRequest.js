import React from "react"
import Grid  from "./Grid"

export default class MedicationRequest extends React.Component
{
    static propTypes = {
        resources: React.PropTypes.arrayOf(React.PropTypes.object)
    };

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title="Medication Requests"
                cols={[
                    {
                        label: "Name",
                        path : "medicationCodeableConcept.coding.0.display"
                    },
                    {
                        label: "Code",
                        path : "medicationCodeableConcept.coding.0.code"
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

