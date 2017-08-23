import React  from "react"
import Grid   from "./Grid"
import Date   from "./Date"

export default class ImmunizationList extends React.Component
{
    static propTypes = {
        resources: React.PropTypes.arrayOf(React.PropTypes.object)
    };

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title="Immunizations"
                cols={[
                    {
                        label: "Type",
                        path: "vaccineCode.coding.0.display"
                    },
                    {
                        label : "Status",
                        render: o => o.status || "-"
                    },
                    {
                        label: "Date",
                        render: o => (
                            o.date ?
                                <Date moment={o.date}/> :
                                "-"
                        )
                    }
                ]}
            />
        );
    }
}