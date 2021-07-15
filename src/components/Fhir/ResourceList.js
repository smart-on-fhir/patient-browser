import React       from "react"
import PropTypes   from "prop-types"
import Grid        from "./Grid"
import { 
    getPath, 
    getCodeOrConcept, 
    codeIsNLPInsight, 
    getInsightSource, 
    InsightSource 
} from "../../lib"
import Period      from "./Period"
import Date        from "./Date"
import moment      from "moment"

function renderCell(record, doHighlight, allOf, oneOf) {

    const entries = [];

    const visit = meta => {
        let propValue = getPath(record, meta.path);
        if (propValue !== undefined) {
            let value = meta.render ? meta.render(record) : propValue;
            let isNLP = doHighlight && Boolean(meta.nlpCodePath) && codeIsNLPInsight(getPath(record, meta.nlpCodePath));
            let raw   = meta.raw ? meta.raw(record) : value;
            let label = typeof meta.label == "function" ? meta.label(record) : meta.label;
            let existing = entries.find(o => o.value === raw);
            if (existing) {
                existing.label += ", " + label
                if (isNLP) {
                    existing.isNLP = true;
                }
            }
            else {
                entries.push({ label, value, isNLP });
            }
            return true;
        }
        return false;
    };

    allOf.forEach(visit);

    if (!entries.length) {
        oneOf.some(visit);
    }

    if (entries.length) {
        return (
            <table>
                <tbody>
                    {
                        entries.map((o, i) => (
                            <tr key={i}>
                                <td className="label-cell">{ o.label }</td>
                                <td className={o.isNLP ? "mark" : ""}>{ o.value }</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        );
    }

    return "-"
}

function getSortValue(rec) {
    const paths = [
        "authoredOn",
        "dateWritten",
        "performedDateTime",
        "recorded",
        "performedPeriod.start",
        "availableTime.0.availableStartTime",
        "whenHandedOver",
        "issued",
        "effectiveDateTime",
        "assertedDate",
        "meta.lastUpdated"
    ];

    for (let i = 0, l = paths.length; i < l; i++) {
        let v = getPath(rec, paths[i]);
        if (v !== undefined) {
            return v
        }
    }

    return 0;
}

function DataLink({settings, path, children}) {
    let url = `${settings.server.url}/${path}`;
    if (settings.fhirViewer.enabled) {
        url = settings.fhirViewer.url +
            (settings.fhirViewer.url.indexOf("?") > -1 ? "&" : "?") +
            settings.fhirViewer.param + "=" +
            encodeURIComponent(url);
    }
    return <a onClick={ () => {
        window.open(url, "_blank");
        return false;
    }}>{ children }</a>
}

DataLink.propTypes = {
    settings: PropTypes.object.isRequired,
    path    : PropTypes.string.isRequired,
    children: PropTypes.any
}

export default class ResourceList extends React.Component
{
    static propTypes = {
        type     : PropTypes.string,
        resources: PropTypes.arrayOf(PropTypes.object).isRequired,
        settings : PropTypes.object.isRequired
    };

    // https://reactjs.org/docs/handling-events.html
    constructor(props) {
        super(props);
        this.state = { doHighlight: false }
        this.toggleHighlight = this.toggleHighlight.bind(this);
    }

    toggleHighlight() {
        this.setState(prevState => ({ 
            doHighlight: !prevState.doHighlight 
        }) );
    }

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
            label: "Identifier",
            render: o => renderCell(o, this.state.doHighlight, [
                {
                    path: "id",
                    label: "ID",
                    ellipsis: 15
                },
                {
                    path: "name",
                    label: "Name"
                },
                {
                    path: "identifier.0.type.coding.0.code",
                    label: "Identifiers",
                    render: rec => {
                        if (Array.isArray(rec.identifier)) {
                            return rec.identifier.map(id => {
                                let code = getPath(id, "type.coding.0.code");
                                if (!code) return null;
                                return code + ": " + id.value;
                            }).filter(Boolean).join(", ")
                        }
                        return "-"
                    }
                }
            ])
        });

        // 2. Details ----------------------------------------------------------
        out.push({
            label: "Details",
            render: o => renderCell(o, this.state.doHighlight, [
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
                    nlpCodePath: "code",
                    label: "Display"
                },
                {
                    path: "medicationCodeableConcept.coding.0.display",
                    nlpCodePath: "medicationCodeableConcept",
                    label: "Medication"
                },
                {
                    path: "medicationCodeableConcept.coding.0.code",
                    nlpCodePath: "medicationCodeableConcept",
                    label: rec => (getPath(rec, "medicationCodeableConcept.coding.0.system") || "").split(/\b/).pop()
                },
                {
                    path: "code.coding.0.code",
                    nlpCodePath: "code",
                    label: rec => ((getPath(rec, "code.coding.0.system") || "")
                        .replace(/\/$/, "").split(/\//).pop() + " code")
                },
                {
                    path: "result.0.display",
                    label: "Result",
                    render: rec => rec.result.map(r => r.display || 0).filter(Boolean).join(", ")
                },
                {
                    label: "Status",
                    render: rec => getCodeOrConcept(rec.status)
                },
                {
                    label: "Clinical Status",
                    render: rec => getCodeOrConcept(rec.clinicalStatus)
                },
                {
                    label: "Verification Status",
                    render: rec => getCodeOrConcept(rec.verificationStatus)
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
                    path: "medicationReference.reference",
                    render: rec => (
                        <DataLink
                            settings={this.props.settings}
                            path={rec.medicationReference.reference}
                        >{ rec.medicationReference.reference }</DataLink>
                    )
                }
            ], [
                {
                    path: "text.div",
                    label: "Text",
                    render: rec => <span dangerouslySetInnerHTML={{ __html: rec.text.div }}/>
                }
            ])
        });

        // 3. Timings ----------------------------------------------------------
        out.push({
            label: "Date",
            render: o => renderCell(o, [
                {
                    path: "authoredOn",
                    label: "Authored On",
                    render: rec => <Date moment={rec.authoredOn}/>
                },
                {
                    path: "dateWritten",
                    label: "Date Written",
                    render: rec => <Date moment={rec.dateWritten}/>
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
                    raw   : rec => moment(rec.issued).format("MM/DD/YYYY"),
                    render: rec =><Date moment={rec.issued}/>
                },
                {
                    path: "effectiveDateTime",
                    label: "Effective",
                    raw   : rec => moment(rec.effectiveDateTime).format("MM/DD/YYYY"),
                    render: rec => <Date moment={rec.effectiveDateTime}/>
                },
                {
                    path: "assertedDate",
                    label: "Asserted",
                    raw   : rec => rec.assertedDate,
                    render: rec => <Date moment={rec.assertedDate}/>
                }
            ], [
                {
                    path: "meta.lastUpdated",
                    label: "Last Updated",
                    raw   : rec => rec.meta.lastUpdated,
                    render: rec => <Date moment={rec.meta.lastUpdated}/>
                }
            ])
        });

        // 4. Insights ---------------------------------------------------------
        out.push ({
            label: <div style={{ textAlign: 'center' }}>
                <button
                    onMouseDown={ this.toggleHighlight }
                    style={{ 
                        backgroundColor: this.state.doHighlight ? '#337ab7' : 'white',
                        color: this.state.doHighlight ? 'white' : '#337ab7',
                        textAlign: 'center'
                    }}
                >
                    <i className="fa fa-lightbulb-o fas fa-bold"/>
                </button>
            </div>,
            render: o => {
                if ( getInsightSource(o) != InsightSource.NONE ) {
                    return (
                        <div style={{ color: '#337ab7', textAlign: 'center' }}>
                            <button>
                                <i className="fa fa-lightbulb-o fas fa-bold"/>
                            </button>
                        </div>
                    )
                } else {
                    return ( <div/> )
                }
            }
        })

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
                cols={this.determineSchema(recs[0].resource)}
                comparator={(a,b) => {
                    let dA = getSortValue(a);
                    let dB = getSortValue(b);
                    dA = dA ? +moment(dA) : 0;
                    dB = dB ? +moment(dB) : 0;
                    return dB - dA;
                }}
            />
        )
    }
}

