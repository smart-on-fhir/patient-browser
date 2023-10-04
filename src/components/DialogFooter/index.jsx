import React                from "react"
import PropTypes            from "prop-types"
import { connect }          from "react-redux"
import { showSelectedOnly } from "../../redux/settings"
import { setParam, fetch }  from "../../redux/query"
import { setAll, setSelectionCleared } from "../../redux/selection"
import "./DialogFooter.less"

const IS_POPUP  = window.opener && window.name;
const IS_FRAME  = parent !== self;

class SelectionUI extends React.Component {

    static propTypes = {
        settings        : PropTypes.object.isRequired,
        selection       : PropTypes.object.isRequired,
        onToggleSelectionVisibility: PropTypes.func.isRequired,
        onResetSelection: PropTypes.func.isRequired,
        canShowSelected : PropTypes.bool
    };

    render() {
        let len = Object.keys(this.props.selection).filter(key => !!this.props.selection[key] && key !== "selectionCleared").length;
        let viewClass = ["btn"];
        let resetClass = ["btn"];

        if (len === 0) {
            viewClass.push("disabled");
            resetClass.push("disabled");
        }

        if (this.props.settings.renderSelectedOnly) {
            viewClass.push("active");
        }

        const hasSelection = this.props.canShowSelected && len > 0
        return (
            <label disabled={ len === 0 }>
                <span>
                    { `${len} patient${len === 1 ? "" : "s"} selected${hasSelection ? ':' : ''}` }
                </span>
                { hasSelection ? (
                    <div className="btn-group">
                        <div className={ viewClass.join(" ") } onClick={
                            () => {
                                this.props.onToggleSelectionVisibility(
                                    !this.props.settings.renderSelectedOnly
                                );
                            }
                        }>View Selected</div>
                        <div className={ resetClass.join(" ") } onClick={
                            () => { this.props.onResetSelection(); }
                        }>Clear Selected</div>
                    </div>
                ) : null }
            </label>
        );
    }
}

export class DialogFooter extends React.Component
{
    static propTypes = {
        selection       : PropTypes.object.isRequired,
        settings        : PropTypes.object.isRequired,
        showSelectedOnly: PropTypes.func.isRequired,
        resetSelection  : PropTypes.func.isRequired,
        setParam        : PropTypes.func.isRequired,
        fetch           : PropTypes.func.isRequired,
        canShowSelected : PropTypes.bool
    };

    /**
     * Generates and returns the object that will be sent back to the client
     * when the OK button is clicked
     */
    export() {
        // debugger;
        const selection = this.props.selection;

        switch (this.props.settings.outputMode) {

        case "id-array": // array of patient IDs
            return Object.keys(selection).filter(k => !!selection[k] && k !== "selectionCleared");

        case "transactions": // array of JSON transactions objects for each patient
            return Object.keys(selection).filter(k => !!selection[k] && k !== "selectionCleared").map(
                k => this.createPatientTransaction(selection[k])
            );

        case "patients": // array of patient JSON objects
            return Object.keys(selection).filter(k => !!selection[k] && k !== "selectionCleared").map(
                k => selection[k]
            );

        case "id-list": // comma-separated list of patient IDs (default)
            return Object.keys(selection).filter(k => !!selection[k] && k !== "selectionCleared").join(",")
        }
    }

    createPatientTransaction() {
        throw new Error("No implemented");
    }

    showSelectedOnly(bOn) {
        if (bOn) {
            const selection = this.props.selection;
            this.props.setParam({
                name : "_id",
                value: Object.keys(selection).filter(k => !!selection[k]).join(",")
            })
        }
        else {
            this.props.setParam({
                name : "_id",
                value: undefined
            })
        }
        this.props.showSelectedOnly(bOn)
    }

    renderDialogButtons() {
        if (!IS_POPUP && !IS_FRAME) {
            return null
        }

        const OWNER = window.opener || window.parent
        let selectionCount = Object.keys(this.props.selection).filter(key => !!this.props.selection[key]).length;


        return (
            <div className="col-xs-6 text-end">
                <button className="btn btn-default" onClick={ () => {
                    OWNER.postMessage({ type: "close" }, "*")
                }}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={ () => {
                    let confirmClose = true;
                    if (selectionCount <= 0 && !this.props.selection.selectionCleared) {
                        confirmClose = window.confirm("No patients have been selected. Choose 'Cancel' to return to making a selection or 'OK' to close without selecting")
                    }
                    if (confirmClose) {
                        OWNER.postMessage(
                            {
                                type: "result",
                                data: this.export()
                            },
                            "*"
                        );
                    }
                }}>
                    OK
                </button>
            </div>
        );
    }

    render() {
        let selection = this.props.selection;
        selection = Object.keys(selection).filter(k => !!selection[k])
        return (
            <div className="row dialog-buttons">
                <div className="col-xs-6 text-start">
                    <SelectionUI
                        selection={ this.props.selection }
                        settings={ this.props.settings }
                        onToggleSelectionVisibility={ this.showSelectedOnly.bind(this) }
                        onResetSelection={ this.props.resetSelection }
                        canShowSelected={ this.props.canShowSelected }
                    />
                </div>
                { this.renderDialogButtons() }
            </div>
        )
    }
}

export default connect(
    state => ({
        selection: state.selection,
        settings : state.settings,
        query    : state.query
    }),
    dispatch => ({
        showSelectedOnly: bValue => {
            dispatch(showSelectedOnly(bValue))
            dispatch(fetch())
        },
        resetSelection  : () => {
            dispatch(setAll({}))
            dispatch(showSelectedOnly(false))
            dispatch(setParam({ name: "_id", value: undefined }))
            dispatch(fetch())
            dispatch(setSelectionCleared())
        },
        setParam: (name, value) => dispatch(setParam(name, value)),
        fetch: () => dispatch(fetch())
    })
)(DialogFooter)
