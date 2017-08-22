import React  from "react"
import moment from "moment"
import Grid   from "./Grid"
import schema from "./schema"

export default class ResourceList extends React.Component
{
    static propTypes = {
        type     : React.PropTypes.string,
        resources: React.PropTypes.arrayOf(React.PropTypes.object)
    };

    render()
    {
        let recs   = this.props.resources || []
        let length = recs.length;
        return (
            <Grid
                rows={(recs || []).map(o => o.resource)}
                title={`${length} resource${length === 1 ? "" : "s"} of type ${this.props.type}`}
                cols={schema[this.props.type] || schema.default}
            />
        )
    }
}

