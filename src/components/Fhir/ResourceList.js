import React  from "react"
import moment from "moment"
import Grid   from "./Grid"

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
                cols={[
                    {
                        label : this.props.type + " ID",
                        render: o => (
                            <b className="text-muted">{o.id}</b>
                        )
                    },
                    {
                        label: "Text",
                        render: o => {
                            if (o.text && o.text.div) {
                                return <div dangerouslySetInnerHTML={{ __html: o.text.div }}/>
                            }
                            return ""
                        }
                    },
                    {
                        label: "Last Updated",
                        render: o => {
                            if (o.meta && o.meta.lastUpdated) {
                                let d = moment(o.meta.lastUpdated)
                                return (
                                    <span title={o.meta.lastUpdated}>
                                        { d.toNow(true) } ago
                                    </span>
                                )
                            }
                            return "-"
                        }
                    }
                ]}
            />
        )
    }
}

