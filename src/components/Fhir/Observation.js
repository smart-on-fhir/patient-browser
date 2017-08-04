import React       from "react"
import moment      from "moment"
import { getPath } from "../../lib"
import Grid        from "./Grid"

export default class Observations extends React.Component
{
    static propTypes = {
        resources: React.PropTypes.arrayOf(React.PropTypes.object)
    };

    renderBloodPressure(resource) {
        let component = resource.component || [resource]
        let out = []
        component.forEach(o => {
            let value = getPath(o, "valueQuantity.value")
            let units = getPath(o, "valueQuantity.unit")
            if (units && (value || value === 0)) {
                out.push(
                    getPath(o, "code.coding.0.display") + ": " +
                    value + " " + units
                )
            }
        });

        return out.join(", ")
    }

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title="Observations"
                cols={[
                    {
                        label : "Name",
                        render: o => {
                            let name = getPath(o, "code.coding.0.display") ||
                                       getPath(o, "code.text");
                            return <b>{name}</b>
                        }
                    },
                    {
                        label : "Value",
                        render: o => {
                            let value = getPath(o, "valueQuantity.value");
                            let units = getPath(o, "valueQuantity.unit");

                            if (getPath(o, "code.coding.0.code") == "55284-4" &&
                                getPath(o, "code.coding.0.system") == "http://loinc.org") {
                                return this.renderBloodPressure(o)
                            }

                            if (!value && value !== 0) {
                                return getPath(o, "valueCodeableConcept.coding.0.display")
                            }

                            if (!isNaN(parseFloat(value))) {
                                value = Math.round(value * 100) / 100;
                            }

                            return <span>{value} <span className="text-muted">{units}</span></span>
                        }
                    },
                    {
                        label: <div className="text-right">Date</div>,
                        render: o => {
                            let date  = getPath(o, "effectiveDateTime");
                            if (date) date = moment(date).format("MM/DD/YYYY");
                            return <div className="text-muted text-right">{ date || "-" }</div>
                        }
                    }
                ]}
            />
        )
    }
}
