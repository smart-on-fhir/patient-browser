import React  from "react"
import moment from "moment"
import Grid   from "./Grid"

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
                        label: <div className="text-right">Date</div>,
                        render: o => (
                            <div className="text-right">
                                { o.date ? moment(o.date).format("MM/DD/YYYY") : "-" }
                            </div>
                        )
                    }
                ]}
            />
        );
    }
}