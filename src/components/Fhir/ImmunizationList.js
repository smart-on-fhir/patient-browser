import React       from "react"
import PropTypes   from "prop-types"
import moment      from "moment"
import Grid        from "./Grid"
import Date        from "./Date"
import { 
    getPath, 
    codeIsNLPInsight, 
    getInsightSource, 
    InsightSource 
} from "../../lib"
import InsightsDetailButton from "./InsightsDetailButton"

export default class ImmunizationList extends React.Component
{
    static propTypes = {
        settings: PropTypes.object.isRequired,
        resources: PropTypes.arrayOf(PropTypes.object)
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
                        render: o => (
                            <div className={codeIsNLPInsight(getPath(o, "vaccineCode")) ? "mark" : ""}>
                                { getPath(o, "vaccineCode.coding.0.display") }
                            </div>
                        )
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
                                o.occurrenceDateTime ?
                                    <Date moment={o.occurrenceDateTime}/> :
                                    o.occurrenceString || "-"
                        )
                    },
                    {
                        label: <div className="text-center">View</div>,
                        render: o => {
                            let url = `${this.props.settings.server.url}/${o.resourceType}/${o.id}`;
                            if (this.props.settings.fhirViewer.enabled) {
                                url = this.props.settings.fhirViewer.url +
                                    (this.props.settings.fhirViewer.url.indexOf("?") > -1 ? "&" : "?") +
                                    this.props.settings.fhirViewer.param + "=" +
                                    encodeURIComponent(url);
                            }

                            return (
                                <div style={{ color: '#337ab7', textAlign: 'center' }}>
                                    <button onClick={ () => window.open(url, "_blank") }>
                                        <i className="fa fa-eye fas fa-bold"/>
                                    </button>
                                </div>
                            )
                        }
                    },
                    {
                        label: <div style={{textAlign: 'center'}}>
                            <button
                                onMouseUp={ this.toggleHighlight }
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
                                return ( <InsightsDetailButton resource={o}/> )
                            } else {
                                return ( <div/> )
                            }
                        }
                    }
                ]}
            />
        );
    }
}