import React       from "react"
import PropTypes   from "prop-types"
import { 
    getPath, 
    getCodeOrConcept, 
    codeIsNLPInsight, 
    getInsightDetails,
    InsightSource
} from "../../lib"

export default class InsightsPopup extends React.Component
{
    static PropTypes = {
        resource:    PropTypes.object
    }

    render()
    {
        let rec = this.props.resource
        let deets = getInsightDetails(rec)
        console.log(deets)
        return (
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
                                <td className="label-cell" style={{fontWeight: "bold"}}>Process Name</td>
                                <td>{deets.processName}</td>
                            </tr>
                            <tr>
                                <td className="label-cell" style={{fontWeight: "bold"}}>Process Type</td>
                                <td>{deets.processType}</td>
                            </tr>
                            <tr>
                                <td className="label-cell" style={{fontWeight: "bold"}}>Process Version</td>
                                <td>{deets.processVersion}</td>
                            </tr>
                            <tr>
                                <td className="label-cell" style={{fontWeight: "bold"}}>Insight Source</td>
                                <td>{deets.insightSource==InsightSource.DOCUMENT ? deets.basedOn : "Self"}</td>
                            </tr>
                        </tbody>
                        { deets.insightSource==InsightSource.DOCUMENT ?
                        <tbody>
                            <tr>
                                <td className="label-cell" style={{fontWeight: "bold"}}>Confidence</td>
                                <td>{Number(deets.confidence)*100}%</td>
                            </tr>
                            <tr>
                                <td className="label-cell" style={{fontWeight: "bold"}}>Covered Text</td>
                                <td><em>"{deets.coveredText}"</em></td>
                            </tr>
                        </tbody>
                        : null}
                    </table>
                </div>
            </div>
        )
    }
}