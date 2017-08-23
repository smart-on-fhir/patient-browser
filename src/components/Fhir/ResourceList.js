import React       from "react"
import Grid        from "./Grid"
import schema      from "./schema"
import { getPath } from "../../lib"
import Period      from "./Period"
import Date        from "./Date"


function Cell(options, record) {
    let propValue = getPath(record, options.path);
    if (propValue !== undefined) {
        let value = options.render ? options.render(record) : propValue
        return (
            <div key={options.path} className="pair">
                <label>{options.label}:&nbsp;</label>
                <span
                    title={ options.ellipsis ? value : null}
                    className={ options.ellipsis ? "ellipsis" : null}
                    style={ options.ellipsis ? { maxWidth: options.ellipsis + "em" } : null}
                >{ value }</span>
            </div>
        );
    }
    return null;
}

export default class ResourceList extends React.Component
{
    static propTypes = {
        type     : React.PropTypes.string,
        resources: React.PropTypes.arrayOf(React.PropTypes.object)
    };

    /**
     * The idea is to have 3 columns by default:
     * 1. Identifier - something like a name, type, id etc.
     * 2. Details - the important part that will describe the resource
     * 3. Timing - time period, time, age etc.
     * @returns {Array} The generated schema
     */
    determineSchema(sampleResource) {
        const out = [];

        if (!sampleResource) {
            return out;
        }

        // 1. Identifier -------------------------------------------------------
        out.push({
            label: "Identifiers",
            render: o => [
                {
                    path: "name",
                    label: "Name"
                },
                {
                    path: "id",
                    label: "ID",
                    ellipsis: 15
                },
                {
                    path: "meta.tag",
                    label: "Tags",
                    render: rec => rec.meta.tag.map(t => t.code)
                }
            ].map(meta => Cell(meta, o)).filter(Boolean) || "-"
        });

        // 2. Details ----------------------------------------------------------
        out.push({
            label: "Details",
            render: o => [
                {
                    path: "description.text",
                    label: "Description"
                },
                {
                    path: "code.text",
                    label: "Code"
                },
                {
                    path: "code.coding.0.display",
                    label: "Display"
                },
                {
                    path: "medicationCodeableConcept.coding.0.display",
                    label: "Medication"
                },
                {
                    path: "result.0.display",
                    label: "Result",
                    render: rec => rec.result.map(r => r.display || 0).filter(Boolean).join(", ")
                },
                {
                    path: "text.div",
                    label: "Text",
                    render: rec => <span dangerouslySetInnerHTML={{ __html: rec.text.div }}/>
                },
                {
                    label: "Status",
                    path: "status"
                },
                {
                    label: "Clinical Status",
                    path: "clinicalStatus"
                },
                {
                    label: "Verification Status",
                    path: "verificationStatus"
                },
                {
                    label: "Value as String",
                    path: "valueString"
                },
                {
                    label: "Comment",
                    path: "comment"
                },
                {
                    label: "Extra Details",
                    path: "extraDetails"
                },
                {
                    label: "Type",
                    path: "type",
                    render: rec => {
                        if (Array.isArray(rec.type)) {
                            return rec.type.map(t => {
                                return t.text || getPath(t, "coding.0.display") || "";
                            }).filter(Boolean).join(", ")
                        }
                        return String(getPath(rec, "type.coding.0.display") || getPath(rec, "type.text") || rec.type);
                    }
                },
                {
                    label: "Criticality",
                    path: "criticality"
                },
                {
                    label: "Category",
                    path: "category",
                    render: rec => {
                        function renderCategory(c) {
                            if (!c) {
                                return "N/A";
                            }

                            if (typeof c == "string") {
                                return c;
                            }

                            if (Array.isArray(c)) {
                                return c.map(renderCategory).join(", ");
                            }

                            if (typeof c != "object") {
                                return "N/A";
                            }

                            return c.text || c.display || c.code || renderCategory(c.coding);
                        }

                        return renderCategory(rec.category);
                    }
                },
                {
                    label: "Quantity",
                    path: "quantity.value",
                    render: rec => (
                        <span>
                            {rec.quantity.value}
                            <span className="text-muted"> {
                                rec.quantity.unit || rec.quantity.units || ""
                            }</span>
                        </span>
                    )
                },
                {
                    label: "Days Supply",
                    path: "daysSupply.value",
                    render: rec => (
                        <span>
                            {rec.daysSupply.value}
                            <span className="text-muted">&nbsp;{
                                rec.daysSupply.unit || rec.daysSupply.units || ""
                            }</span>
                        </span>
                    )
                },
                {
                    label: "Medication",
                    path: "medicationReference.reference"
                }
            ].map(meta => Cell(meta, o)).filter(Boolean) || "-"
        });

        // 2. Timings ----------------------------------------------------------
        out.push({
            label: "Timings",
            render: o => [
                {
                    path: "authoredOn",
                    label: "Authored On",
                    render: rec => <Date moment={rec.authoredOn}/>
                },
                {
                    path: "performedDateTime",
                    label: "Performed At",
                    render: rec => <Date moment={rec.performedDateTime}/>
                },
                {
                    path: "recorded",
                    label: "Recorded",
                    render: rec => <Date moment={rec.recorded}/>
                },
                {
                    path: "performedPeriod",
                    label: "Performed",
                    render: rec => Period(rec.performedPeriod)
                },
                {
                    path: "availableTime",
                    label: "Available Time",
                    render: rec => {
                        if (Array.isArray(rec.availableTime)) {
                            return rec.availableTime.map((t, i) => (
                                <div key={i}>
                                    { t.availableStartTime && (<span>
                                        <label>from:&nbsp;</label>
                                        <span>{ t.availableStartTime }&nbsp;</span>
                                    </span>) }
                                    { t.availableEndTime && (<span>
                                        <label>to:&nbsp;</label>
                                        <span>{ t.availableEndTime }</span>
                                    </span>) }
                                </div>
                            ));
                        }
                        return "N/A"
                    }
                },
                {
                    path: "whenHandedOver",
                    label: "Handed Over",
                    render: rec => <Date moment={rec.whenHandedOver}/>
                },
                {
                    path: "issued",
                    label: "Issued",
                    render: rec =><Date moment={rec.issued}/>
                },
                {
                    path: "effectiveDateTime",
                    label: "Effective",
                    render: rec => <Date moment={rec.effectiveDateTime}/>
                },
                {
                    path: "assertedDate",
                    label: "Asserted",
                    render: rec => <Date moment={rec.assertedDate}/>
                },
                {
                    path: "meta.lastUpdated",
                    label: "Last Updated",
                    render: rec => <Date moment={rec.meta.lastUpdated}/>
                    // render: (rec => <span title={rec.meta.lastUpdated}>{ moment(rec.meta.lastUpdated).toNow(true) } ago</span>)
                }
            ].map(meta => Cell(meta, o)).filter(Boolean) || "-"
        });

        return out;
    }

    render()
    {
        let recs   = this.props.resources || []
        let length = recs.length;
        return (
            <Grid
                rows={recs.map(o => o.resource)}
                title={`${length} resource${length === 1 ? "" : "s"} of type ${this.props.type}`}
                cols={
                    schema[this.props.type] || this.determineSchema(recs[0].resource)
                }
            />
        )
    }
}

