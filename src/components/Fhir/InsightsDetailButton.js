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
        let details = getInsightDetails(rec)
        let isDocument = details.insightSource==InsightSource.DOCUMENT
        let prettyDate = new Date(details.lastUpdated).toUTCString()

        let sourceUrl
        if (isDocument) {
            sourceUrl = `${this.props.settings.server.url}/${details.basedOn}`;
            if (this.props.settings.fhirViewer.enabled) {
                sourceUrl = this.props.settings.fhirViewer.url +
                    (this.props.settings.fhirViewer.url.indexOf("?") > -1 ? "&" : "?") +
                    this.props.settings.fhirViewer.param + "=" +
                    encodeURIComponent(sourceUrl);
            } else {
                sourceUrl += "?_format=json&_pretty=true"
            }
        }

        return (
            <div className="text-primary text-center">
                <Popup
                    trigger={
                        <button>
                            <i className="fa fa-lightbulb-o fas fa-bold"/>
                        </button>
                    }
                    position="left center"
                    on={['hover', 'click', "focus"]}
                >
                    <div className="drop-shadow panel panel-default">
                        <div className="panel-heading">
                            <b className="text-primary">
                                <i className="fa fa-lightbulb-o fas fa-bold" style={{paddingRight: 10}}/>Insights for {rec.resourceType} {rec.id}
                            </b>
                        </div>
                        <div className="table-responsive" role="presentation">
                            <table className="table table-condensed table-hover table-striped table-bordered">
                                <tbody>
                                    <tr>
                                        <td><strong>Last Updated</strong></td>
                                        <td>{prettyDate}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Process Name</strong></td>
                                        <td>{details.processName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Process Type</strong></td>
                                        <td>{details.processType}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Process Version</strong></td>
                                        <td>{details.processVersion}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Insight Source</strong></td>
                                        <td>{isDocument ? <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{details.basedOn.replace("/", " ")}</a> : details.insightSource}</td>
                                    </tr>
                                </tbody>
                                { isDocument ?
                                <tbody>
                                    <tr>
                                        <td><strong>Covered Text</strong></td>
                                        <td>"...<em>{details.coveredText}</em>..." [{details.offsetBegin}:{details.offsetEnd}]</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Confidence</strong></td>
                                        <td>{Number(details.confidence)*100}%</td>
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