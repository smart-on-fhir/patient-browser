import React       from "react"
import PropTypes   from "prop-types"
import { 
    getPath, 
    getCodeOrConcept, 
    codeIsNLPInsight, 
    getInsightSystem,
    getInsightSource, 
    InsightSource
} from "../../lib"

export default class InsightsPopup extends React.Component
{
    static PropTypes = {
        resource:    PropTypes.object,
        closeWindow: PropTypes.func
    };

    handleClick() {
        this.props.closeWindow()
    }

    render()
    {
        let rec = this.props.resource
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <b className="text-primary">
                            Insights for {rec.resourceType} {rec.id}
                        </b>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-condensed table-hover table-striped table-bordered">
                            <tbody>
                                <tr>
                                    <td className="label-cell" style={{fontWeight: "bold"}}>Insight Source</td>
                                    <td>{getInsightSource(rec)}</td>
                                </tr>
                                <tr>
                                    <td className="label-cell" style={{fontWeight: "bold"}}>Insight System</td>
                                    <td>{getInsightSystem(rec)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}