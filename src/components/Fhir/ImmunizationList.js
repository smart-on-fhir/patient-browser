import React       from "react"
import moment      from "moment"
import Grid        from "./Grid"
import Date        from "./Date"
import { getPath } from "../../lib"

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
                groupBy="Type"
                comparator={(a,b) => {
                    let dA = getPath(a, "date");
                    let dB = getPath(b, "date");
                    dA = dA ? +moment(dA) : 0;
                    dB = dB ? +moment(dB) : 0;
                    return dB - dA;
                }}
                cols={[
                    {
                        name : "Type",
                        label: <b><i className="fa fa-flask"/> Type</b>,
                        path : "vaccineCode.coding.0.display"
                    },
                    {
                        label: <b><i className="fa fa-check"/> Status</b>,
                        render: o => o.status || "-"
                    },
                    {
                        label: <b><i className="glyphicon glyphicon-time"/> Date</b>,
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