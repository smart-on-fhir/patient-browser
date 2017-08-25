import React       from "react"
import PropTypes   from "prop-types"
import moment      from "moment"
import { getPath } from "../../lib"
import Grid        from "./Grid"
import ValueRange  from "./ValueRange"
import Time        from "./Time"
import Period      from "./Period"
import Date        from "./Date"

export default class Observations extends React.Component
{
    static propTypes = {
        resources: PropTypes.arrayOf(PropTypes.object)
    };

    getObservationLabel(o) {
        return (
            getPath(o, "code.coding.0.display") ||
            getPath(o, "code.text") ||
            getPath(o, "valueQuantity.code")
        );
    }

    renderObservation(o, includeLabel = false) {
        if (Array.isArray(o.component)) {
            return o.component.map((c, i) => {
                let result = this.renderObservation(c, true);
                return (
                    <span key={i}>
                        { i > 0 && <span>,&nbsp;</span> }
                        {result}
                    </span>
                );
            });
        }

        const returnResult = result => {
            return (
                <span>
                    {includeLabel && <label className="text-muted">{
                        this.getObservationLabel(o)
                        .replace(/^\s*(Systolic|Diastolic)\s+blood\s+pressure\s*$/gi, "$1")
                    }:&nbsp;</label>}
                    {result}
                </span>
            );
        };

        // valueBoolean
        if (o.hasOwnProperty("valueBoolean")) {
            return returnResult(
                !o.valueBoolean || o.valueBoolean == "false" ?
                "Negative" :
                "Positive"
            );
        }

        // valueString
        if (o.hasOwnProperty("valueString")) {
            return returnResult(String(o.valueString));
        }

        // valueRange
        if (o.hasOwnProperty("valueRange")) {
            return returnResult(<ValueRange range={o.valueRange}/>)
        }

        // valueTime
        if (o.hasOwnProperty("valueTime")) {
            return returnResult(<Time moment={o.valueTime}/>)
        }

        // valueDateTime
        if (o.hasOwnProperty("valueDateTime")) {
            return returnResult(<Date moment={o.valueDateTime}/>)
        }

        // valuePeriod
        if (o.hasOwnProperty("valuePeriod")) {
            return returnResult(Period(o.valuePeriod));
        }

        // valueCodeableConcept
        if (o.hasOwnProperty("valueCodeableConcept")) {
            return returnResult(getPath(o, "valueCodeableConcept.coding.0.display"));
        }

        // valueQuantity
        if (o.hasOwnProperty("valueQuantity")) {
            let value = getPath(o, "valueQuantity.value");
            let units = getPath(o, "valueQuantity.unit");

            if (!isNaN(parseFloat(value))) {
                value = Math.round(value * 100) / 100;
            }

            return returnResult(
                <span>{value} <span className="text-muted">{units}</span></span>
            );
        }

        /* TODO:
        valueRatio      : Ratio
        valueSampledData: SampledData
        valueAttachment : Attachment
        */

        return returnResult(<span className="text-muted">N/A</span>)
    }

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title="Observations"
                groupBy="Name"
                comparator={(a,b) => {
                    let dA = getPath(a, "effectiveDateTime") || getPath(a, "meta.lastUpdated");
                    let dB = getPath(b, "effectiveDateTime") || getPath(b, "meta.lastUpdated");
                    dA = dA ? +moment(dA) : 0;
                    dB = dB ? +moment(dB) : 0;
                    return dB - dA;
                }}
                cols={[
                    {
                        label : "Name",
                        path  : o => this.getObservationLabel(o),
                        render: o => <b>{this.getObservationLabel(o)}</b>
                    },
                    {
                        label : "Value",
                        render: o => this.renderObservation(o)
                    },
                    {
                        label: "Date",
                        render: o => {
                            let date = getPath(o, "effectiveDateTime") || getPath(o, "meta.lastUpdated");
                            if (date) date = moment(date).format("MM/DD/YYYY");
                            return <div className="text-muted">{ date || "-" }</div>
                        }
                    }
                ]}
            />
        )
    }
}
