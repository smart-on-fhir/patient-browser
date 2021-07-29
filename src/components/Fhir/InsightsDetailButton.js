import React         from "react"
import PropTypes     from "prop-types"
import Popup         from "reactjs-popup"
import { 
    getInsightDetails,
    InsightSource
} from "../../lib"

export default class InsightsDetailButton extends React.Component {
    static PropTypes = {
        settings: PropTypes.object.isRequired,
        resource: PropTypes.object
    }

    render() {
        let rec = this.props.resource
        let deets = getInsightDetails(rec)
        let isDocument = deets.insightSource==InsightSource.DOCUMENT
        let prettyDate = new Date(deets.lastUpdated).toUTCString()

        let sourceUrl
        if (isDocument) {
            sourceUrl = `${this.props.settings.server.url}/${deets.basedOn}`;
            if (this.props.settings.fhirViewer.enabled) {
                sourceUrl = this.props.settings.fhirViewer.url +
                    (this.props.settings.fhirViewer.url.indexOf("?") > -1 ? "&" : "?") +
                    this.props.settings.fhirViewer.param + "=" +
                    encodeURIComponent(sourceUrl);
            } else {
                sourceUrl += "?_format=json&_pretty=true"
            }
        }
        console.log(sourceUrl)

        return (
            <div style={{ color: '#337ab7', textAlign: 'center' }}>
                <Popup
                    trigger={
                        <button>
                            <i className="fa fa-lightbulb-o fas fa-bold"/>
                        </button>
                    }
                    position="left center"
                    on={['hover', 'click', "focus"]}
                >
                    <div style={{boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}} className="panel panel-default">
                        <div className="panel-heading">
                            <b className="text-primary">
                                <i className="fa fa-lightbulb-o fas fa-bold" style={{paddingRight: 10}}/>Insights for {rec.resourceType} {rec.id}
                            </b>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-condensed table-hover table-striped table-bordered">
                                <tbody>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}>Last Updated</td>
                                        <td>{prettyDate}</td>
                                    </tr>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}>Process Name</td>
                                        <td>{deets.processName}</td>
                                    </tr>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}>Process Type</td>
                                        <td>{deets.processType}</td>
                                    </tr>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}>Process Version</td>
                                        <td>{deets.processVersion}</td>
                                    </tr>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}>Insight Source</td>
                                        <td>{isDocument ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{deets.basedOn.replace("/", " ")}</a> : deets.insightSource}</td>
                                    </tr>
                                </tbody>
                                { isDocument ?
                                <tbody>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}>Covered Text</td>
                                        <td>"...<em>{deets.coveredText}</em>..." [{deets.offsetBegin}:{deets.offsetEnd}]</td>
                                    </tr>
                                    <tr>
                                        <td style={{fontWeight: "bold"}}>Confidence</td>
                                        <td>{Number(deets.confidence)*100}%</td>
                                    </tr>
                                </tbody>
                                : null }
                            </table>
                        </div>
                    </div>
                </Popup>
            </div>
        )
    }
}