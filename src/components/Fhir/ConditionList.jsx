import React            from "react"
import PropTypes        from "prop-types"
import { CODE_SYSTEMS } from "../../lib/constants"
import Grid             from "./Grid"
import Date             from "./Date"
import { getPath, getCodeOrConcept } from "../../lib"
import moment           from "moment"

export default class ConditionList extends React.Component
{
    static propTypes = {
        resources: PropTypes.arrayOf(PropTypes.object)
    };

    render()
    {
        let recs   = this.props.resources || []
        let length = recs.length;
        return (
            <Grid
                rows={(recs || []).map(o => o.resource)}
                title={`${length} Condition${length === 1 ? "" : "s"}`}
                comparator={(a,b) => {
                    let dA = getPath(a, "onsetDateTime");
                    let dB = getPath(b, "onsetDateTime");
                    dA = dA ? +moment(dA) : 0;
                    dB = dB ? +moment(dB) : 0;
                    return dB - dA;
                }}
                cols={[
                    {
                        label: "Condition",
                        render: o => {
                            let name   = "-";
                            let code   = "-";
                            let system = "";

                            if (o.code) {
                                if (o.code.text) {
                                    name = o.code.text;
                                }
                                if (Array.isArray(o.code.coding) && o.code.coding.length) {
                                    let c = o.code.coding[0]

                                    system = c.system
                                    for (let key in CODE_SYSTEMS) {
                                        if (CODE_SYSTEMS[key].url === c.system) {
                                            system = `(${key})`;
                                            break;
                                        }
                                    }

                                    if (c.display) {
                                        name = c.display
                                    }
                                    if (c.code) {
                                        code = c.code
                                    }
                                }
                            }
                            return (
                                <div className="d-flex justify-content-between">
                                    <b>{ name }</b>
                                    <small className="text-muted">
                                        { code } {system}
                                    </small>
                                </div>
                            )
                        }
                    },
                    {
                        label: <div className="text-center">Clinical Status</div>,
                        render: o => <div className="text-center">{ getCodeOrConcept(o.clinicalStatus) }</div>
                    },
                    {
                        label : <div className="text-center">Verification Status</div>,
                        render: o => <div className="text-center">{ getCodeOrConcept(o.verificationStatus) }</div>
                    },
                    {
                        label: <div className="text-center">Onset Date</div>,
                        render : o => {
                            let onset = o.onsetDateTime || "";
                            return (
                                <div className="text-center">
                                    {
                                        onset ?
                                        <Date moment={o.onsetDateTime}/> :
                                        "-"
                                    }
                                </div>
                            );
                        }
                    }
                ]}
            />
        )
    }
}