import React       from "react"
import PropTypes   from "prop-types"
import { 
    getPath, 
    getCodeOrConcept, 
    codeIsNLPInsight, 
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
            <div style={{display: 'none', position: 'fixed', zIndex: '99'}}>
                <div style={{backgroundColor: 'white', position: 'absolute'}}>
                    <p>I'm A Pop Up!!!</p>
                </div>
            </div>
        )
    }
}