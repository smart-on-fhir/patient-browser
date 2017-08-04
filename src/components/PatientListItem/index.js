import React        from "react"
import { Link }     from "react-router-dom"
import PatientImage from "../PatientImage"
import {
    getPatientName,
    getPatientAge,
    renderSearchHighlight,
    getPatientMRN
} from "../../lib"

const TYPES = React.PropTypes

export default class PatientListItem extends React.Component
{
    /**
     * This component expects a Fhir Bundle
     */
    static propTypes = {
        patient          : TYPES.object,
        query            : TYPES.object,
        settings         : TYPES.object,
        selected         : TYPES.bool,
        onSelectionChange: TYPES.func,
        index            : TYPES.number
    };

    static defaultProps = {
        onSelectionChange: () => 1
    };

    render() {
        let age = getPatientAge(this.props.patient)
        let name = getPatientName(this.props)
        if (this.props.query.params.name) {
            name = renderSearchHighlight(name, this.props.query.params.name)
        }

        return (
            <Link
                to={ "/patient/" + this.props.index }
                className={ "patient" + ( this.props.selected ? " selected" : "") }
            >
                <div
                    className="patient-select-zone"
                    onClick={ e => {
                        e.stopPropagation()
                        e.preventDefault()
                        this.props.onSelectionChange(this.props.patient)
                    }}
                >
                    <i className={
                        this.props.selected ?
                        "fa fa-check-square-o" :
                        "fa fa-square-o"
                    }/>
                </div>
                <PatientImage patient={ this.props.patient } base={ this.props.settings.server.url }/>
                <div className="patient-info">
                    <b>{ name } {
                        this.props.patient.deceasedBoolean || this.props.patient.deceasedDateTime ?
                        <span className="deceased-label">Deceased</span> :
                        null
                    }</b>
                    <small><b>{age}</b> old { this.renderGender() }</small>
                    <footer className="small">
                        <span>
                            DOB: { this.props.patient.birthDate || "Unknown" }
                            {
                                this.props.patient.deceasedDateTime ?
                                ' / DOD: ' + this.props.patient.deceasedDateTime :
                                null
                            }
                        </span>
                        <span>ID: { this.props.patient.id || "Unknown" }</span>
                        <span>MRN: { getPatientMRN(this.props.patient) || "Unknown" }</span>
                    </footer>
                </div>
                <i className="fa fa-angle-right"/>
            </Link>
        )
    }

    renderGender() {
        let gender = this.props.patient.gender
        if (!gender) {
            return null
        }

        return (
            <span className={ gender }>{ gender }</span>
        );
    }
}