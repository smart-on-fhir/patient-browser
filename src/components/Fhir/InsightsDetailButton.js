import React         from "react"
import PropTypes     from "prop-types"
import Popup         from "reactjs-popup"
import InsightsPopup from "../InsightsPopup"

export default class InsightsDetailButton extends React.Component {
    static PropTypes = {
        resource: PropTypes.object
    }

    render() {
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
                    <InsightsPopup resource={this.props.resource}/>
                </Popup>
            </div>
        )
    }
}