import React       from "react"
import Grid        from "./Grid"
import { getPath } from "../../lib"
import Period      from "./Period"

function getEncounterClass(encounter) {
    return encounter.class && typeof encounter.class == "object" ?
        getPath(encounter, "class.type.0.text") :
        encounter.class;
}

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
                        render: rec => {
                            let result = getPath(rec, "type.0.text");
                            if (result) {
                                return <b>{ result }</b>;
                            }
                            let _class = getEncounterClass(rec);
                            if (_class) {
                                return (
                                    <span className="text-muted">{_class + " encounter"}</span>
                                );
                            }
                            return <small className="text-muted">N/A</small>;
                        }
                    },
                    {
                        label: "Reason",
                        path : "reason.0.coding.0.display",
                        defaultValue: "N/A"
                    },
                    {
                        label: "Class",
                        render: rec => {
                            let result = getEncounterClass(rec);
                            return result ?
                                <b>{ result }</b> :
                                <small className="text-muted">N/A</small>;
                        }
                    },
                    {
                        label: "Status",
                        path : "status",
                        defaultValue: "N/A"
                    },
                    {
                        label: "Time",
                        render: o => Period(o.period)
                    }
                ]}
            />
        )
    }
}

