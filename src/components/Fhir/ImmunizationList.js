import React       from "react"
import PropTypes   from "prop-types"
import moment      from "moment"
import Grid        from "./Grid"
import Date        from "./Date"
import { getPath } from "../../lib"

export default class ImmunizationList extends React.Component
{
    static propTypes = {
        resources: PropTypes.arrayOf(PropTypes.object)
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
                        label: "Type",
                        path : "vaccineCode.coding.0.display"
                    },
                    {
                        label: "Status",
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