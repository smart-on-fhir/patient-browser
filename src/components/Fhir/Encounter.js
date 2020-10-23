import React       from "react"
import PropTypes   from "prop-types"
import moment      from "moment"
import Grid        from "./Grid"
import { getPath } from "../../lib"
import Period      from "./Period"

function getEncounterClass(encounter) {
    return encounter.class && typeof encounter.class == "object" ?
        getPath(encounter, "class.display") :
        encounter.class;
}

function getEncounterLabel(encounter) {
    let result = getPath(encounter, "type.0.text");
    if (result) {
        return result;
    }
    let _class = getEncounterClass(encounter);
    if (_class) {
        return _class + " encounter";
    }
    return "";
}

export default class Encounter extends React.Component
{
    static propTypes = {
        resources: PropTypes.arrayOf(PropTypes.object)
    };

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title={ `Encounter${this.props.resources.length === 1 ? "" : "s"}` }
                groupBy="Type"
                comparator={(a,b) => {
                    let dA = getPath(a, "period.start");
                    let dB = getPath(b, "period.start");
                    dA = dA ? +moment(dA) : 0;
                    dB = dB ? +moment(dB) : 0;
                    return dB - dA;
                }}
                cols={[
                    {
                        label: "Type",
                        path: rec => getEncounterLabel(rec),
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
                        path : "period",
                        render: o => Period(o.period || {})
                    }
                ]}
            />
        )
    }
}

