import React                from "react"
import PropTypes            from "prop-types"
import { withParams }       from "../../lib/withParams"
import PatientImage         from "../PatientImage"
import Loader               from "../Loader"
import { connect }          from "react-redux"
import $                    from "jquery"
import { Link }             from "react-router-dom"
import DialogFooter         from "../DialogFooter"
import { toggle }           from "../../redux/selection"
import store                from "../../redux"
import { queryBuilder }     from "../../redux/query"
import Observations         from "../Fhir/Observation"
import ImmunizationList     from "../Fhir/ImmunizationList"
import ConditionList        from "../Fhir/ConditionList"
import Encounter            from "../Fhir/Encounter"
import CarePlan             from "../Fhir/CarePlan"
import Person               from "../Fhir/Person"
import ResourceList         from "../Fhir/ResourceList"
import {
    getErrorMessage,
    getPatientName,
    getPatientPhone,
    getPatientEmail,
    getPatientHomeAddress,
    getPatientAge,
    getPath,
    intVal,
    getBundleURL,
    parseQueryString,
    getPatientMRN,
    getAllPages
} from "../../lib"
import "./PatientDetail.less"

/**
 * Renders the detail page.
 */
export class PatientDetail extends React.Component
{
    static propTypes = {
        match    : PropTypes.object,
        settings : PropTypes.object,
        selection: PropTypes.object,
        query    : PropTypes.object
    };

    constructor(...args)
    {
        super(...args)
        this.query = queryBuilder.clone();
        this.state = {
            loading       : false,
            error         : null,
            conditions    : [],
            patient       : {},
            index         : 0,
            hasNext       : false,
            groups        : {},
            selectedSubCat: "",
            bundle        : $.isEmptyObject(this.props.query.bundle) ?
                null :
                { ...this.props.query.bundle }
        };
    }

    componentDidMount()
    {
        this.fetch(this.props.params.index);
    }

    componentWillReceiveProps(newProps)
    {
        if (newProps.params.index !== this.props.params.index) {
            this.fetch(newProps.params.index);
        }
    }

    fetch(index)
    {
        index = intVal(index, -1);
        if (index < 0) {
            return this.setState({ error: new Error("Invalid patient index") });
        }

        this.setState({ loading: true, index }, () => {
            this.fetchPatient(this.props.settings.server, index)
            .then(
                state => {
                    // console.log(state);
                    this.setState({
                        ...state,
                        error: null,
                        loading: false
                    })
                }
            )
            .catch(error => {
                this.setState({
                    loading   : false,
                    error
                })
            })
        })
    }

    /**
     * This page receives an "index" url parameter. It will repeat the same
     * query from the search page but with limit=1 and offset=index so that the
     * search returns only one page. The reason for this is that we also have
     * these "Prev Patient" and "Next Patient" buttons that allow the user to
     * walk through the result one patient at a time.
     * @param {Object} server
     * @param {Object} server.url
     * @param {Object} server.type
     * @param {Number} index
     */
    fetchPatient(server, index)
    {
        // =====================================================================
        // Warning! The following are some ugly workarounds for the ugly API
        // that does not support normal pagination!
        // =====================================================================

        return Promise.resolve({ ...this.state })

        // Run the main query to fetch the first page
        .then(state => {
            this.query.cacheId = null;
            this.query.offset  = null;
            return this.query.fetch(server).then(
                bundle => {
                    state.bundle = bundle;
                    return state;
                }
            );
        })

        // Try to find the patient by index
        .then(state => {
            index = intVal(index, -1);
            if (index < 0) {
                return Promise.reject("Invalid patient index");
            }

            state.patient = getPath(state, `bundle.entry.${index}.resource`);
            state.nextURL = getBundleURL(state.bundle, "next");
            state.hasNext = !!state.nextURL || (state.patient ? index < state.bundle.entry.length - 1 : false);
            return Promise.resolve(state);
        })

        // if no patient - jump to it's index
        .then(state => {
            if (!state.patient) {
                let params   = parseQueryString(state.nextURL);
                this.query.setOffset(params._getpages, index);
                return this.query.fetch(server).then(
                    bundle => {
                        state.bundle  = bundle;
                        state.patient = getPath(state, `bundle.entry.0.resource`);
                        state.hasNext = state.patient ?
                            this.query.limit && this.query.limit > 1 ?
                                state.bundle.entry.length > 1 :
                                getBundleURL(state.bundle, "next") :
                            false;
                        return state;
                    }
                )
            }
            return state;
        })

        .then(state => new Promise(resolve => {
            this.setState(state, () => resolve(state))
        }))

        // Find $everything
        .then(state => {
            return getAllPages({ url: `${server.url}/Patient/${state.patient.id}/$everything?_count=500` })
            .then(data => {
                let groups = {};
                data.forEach(entry => {
                    let resourceType = getPath(entry, "resource.resourceType") || "Other";
                    let type = resourceType;

                    if (type == "Observation") {
                        let subCat = String(
                            getPath(entry, "resource.category.0.text") ||
                            getPath(entry, "resource.category.coding.0.code") ||
                            getPath(entry, "resource.category.0.coding.0.code") ||
                            "Other"
                        ).toLowerCase();

                        subCat = subCat.split(/\-+/).map(token => {
                            return token.charAt(0).toUpperCase() + token.substr(1)
                        }).join(" ");
                        type += " - " + subCat;
                    }

                    if (!Array.isArray(groups[type])) {
                        groups[type] = []
                    }
                    groups[type].push(entry)
                })
                state.groups = groups
                return state
            })
        })

        // Feed the results to the app
        .then(
            state => Promise.resolve(state),
            error => Promise.reject(new Error(getErrorMessage(error)))
        )
    }

    // Rendering methods -------------------------------------------------------

    renderPatient()
    {
        if (this.state.error) {
            return this.state.error + ""
        }

        let idLower = (this.state.patient.id || "").toLowerCase();
        let key = idLower && Object.keys(this.props.selection).find(k => k.toLowerCase() == idLower);
        let selected = key && this.props.selection[key] !== false;
        return (
            <div className="panel panel-default patient col-xs-12">
                <div className="row">
                    { this.state.loading ? <Loader/> : null }
                    <div className="col-xs-2 col-sm-2 col-md-1">
                        <div className="embed-responsive">
                            <PatientImage
                                patient={ this.state.patient }
                                className="embed-responsive-item"
                                base={ this.props.settings.server.url }
                            />
                        </div>
                    </div>
                    <div className="col-xs-10 col-md-11">
                        <div className="patient-row">
                            <div className="col-xs-7 patient-name">
                                <h3 className="float-start text-primary">
                                    { getPatientName(this.state.patient) || (this.state.loading ? "loading..." : "Unknown") }
                                </h3>
                                {
                                    selected ?
                                    <i className="label label-success float-start">Selected</i> :
                                    null
                                }
                            </div>
                            <div className="col-xs-5 text-right" style={{ paddingRight: 0 }}>
                                <button
                                    type="button"
                                    className={`btn btn-sm btn-${selected ? "danger" : "primary"}`}
                                    onClick={() => store.dispatch(toggle({ id: this.state.patient.id })) }
                                >
                                    {
                                        selected ? "Unselect" : "Select"
                                    }
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-default btn-sm"
                                    onClick={() => this.fetch(this.props.params.index)}
                                >
                                    <i className="fa fa-refresh"/> Reload
                                </button>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">Gender:</div>
                            <div className="col-xs-8 col-sm-3 col-lg-3 text-left">
                                { this.state.patient.gender || (this.state.loading ? "loading..." : "Unknown") }
                            </div>
                            <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">DOB:</div>
                            <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                                { this.state.patient.birthDate || (this.state.loading ? "loading..." : "Unknown") }
                            </div>

                            <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">Age:</div>
                            <div className="col-xs-8 col-sm-3 col-lg-3 text-left">
                                { getPatientAge(this.state.patient) || (this.state.loading ? "loading..." : "Unknown") }
                            </div>
                            <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">Email</div>
                            <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                                { getPatientEmail(this.state.patient) || (this.state.loading ? "loading..." : "Unknown") }
                            </div>
                            <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">Phone:</div>
                            <div className="col-xs-8 col-sm-3 col-lg-3 text-left">
                                { getPatientPhone(this.state.patient) || (this.state.loading ? "loading..." : "Unknown") }
                            </div>
                            <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">Address:</div>
                            <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                                { getPatientHomeAddress(this.state.patient) || (this.state.loading ? "loading..." : "Unknown") }
                            </div>
                            <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">ID:</div>
                            <div className="col-xs-8 col-sm-3 col-lg-3 text-left">
                                { this.state.patient.id || (this.state.loading ? "loading..." : "Unknown") }
                            </div>
                            <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">MRN:</div>
                            <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                                { getPatientMRN(this.state.patient) || (this.state.loading ? "loading..." : "Unknown") }
                            </div>
                            {
                                this.state.patient.deceasedBoolean || this.state.patient.deceasedDateTime ?
                                (
                                    <div className="col-xs-4 col-sm-2 col-lg-1 text-right text-muted">
                                        <span className="deceased-label">Deceased:</span>
                                    </div>
                                ) :
                                null
                            }
                            {
                                this.state.patient.deceasedBoolean || this.state.patient.deceasedDateTime ?
                                (
                                    <div className="col-xs-8 col-sm-5 col-lg-3 text-left">
                                        {
                                            this.state.patient.deceasedDateTime ?
                                            <span>{ this.state.patient.deceasedDateTime }</span> :
                                            <span>{ this.state.patient.deceasedBoolean ? "Yes" : "No" }</span>
                                        }
                                    </div>
                                ) :
                                null
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderResources(type) {
        let items = this.state.groups[type] || [];
        if (!items.length) {
            return (
                <p className="text-center text-muted">
                    No items of type "{type}" found
                </p>
            )
        }

        if (type.indexOf("Observation") === 0) {
            return <Observations resources={items}/>;
        }

        switch (type) {
        case "Immunization":
            return <ImmunizationList resources={items}/>;
        case "Condition":
            return <ConditionList resources={items}/>
        case "Encounter":
            return <Encounter resources={items}/>;
        case "CarePlan":
            return <CarePlan resources={items}/>;
        case "Patient":
        case "Practitioner":
        case "RelatedPerson":
            return <Person resources={items} title={type} />;
        default:
            return <ResourceList resources={items} type={type} settings={this.props.settings}/>;
        }
    }

    render()
    {
        let groups = Object.keys(this.state.groups).sort()
        let selectedSubCat = this.state.selectedSubCat
        if (!selectedSubCat || !this.state.groups[selectedSubCat]) {
            selectedSubCat = Object.keys(this.state.groups)[0] || ""
        }

        return (
            <div className="page patient-detail-page">
                <nav className="navbar bg-primary navbar-fixed-top">
                    <div className="container-fluid">
                        <div className="row navigator">
                            <div className="col-xs-4 col-sm-4 col-md-3 col-lg-2">
                                <Link
                                    to={ `/patient/${this.state.index - 1}` }
                                    className="btn btn-primary btn-block"
                                    disabled={ this.state.index < 1 }
                                >
                                    <i className="fa fa-chevron-left"/>
                                    <b>Prev<span className="hidden-xs">ious Patient</span></b>
                                </Link>
                            </div>
                            <div className="col-xs-4 col-sm-4 col-md-6 col-lg-8 text-center">
                                <Link className="btn btn-block text-center" to="/">
                                    <span className="hidden-xs">Browse Patients</span>
                                    <span className="visible-xs">Browse</span>
                                </Link>
                            </div>
                            <div className="col-xs-4 col-sm-4 col-md-3 col-lg-2 text-right">
                                <Link
                                    to={ `/patient/${this.state.index + 1}` }
                                    className="btn btn-primary btn-block"
                                    disabled={ !this.state.hasNext }
                                >
                                    <b>Next<span className="hidden-xs"> Patient</span></b>
                                    <i className="fa fa-chevron-right"/>
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>
                <div className="container">

                    { this.renderPatient() }

                    {
                        groups.length ?
                        <div className="row patient-details">
                            <br/>
                            <div className="col-xs-12 col-sm-3">
                                <ul className="list-group">
                                {
                                    groups.map((k, i) => (
                                        <a
                                            href="#"
                                            key={i}
                                            className={ "list-group-item" + (k === selectedSubCat ? " active" : "") }
                                            onClick={e => {
                                                e.preventDefault()
                                                this.setState({
                                                    selectedSubCat: k
                                                })
                                            }}
                                        >
                                            <b className="badge float-end">{this.state.groups[k].length}</b>
                                            <b>{k}</b>
                                        </a>
                                    ))
                                }
                                </ul>
                            </div>
                            <div className="col-xs-12 col-sm-9">
                                { this.renderResources(selectedSubCat) }
                            </div>
                        </div> :
                        this.state.loading ?
                            null:
                            <div className="row">
                                <div className="col-xs-12 text-muted text-center">
                                    No additional details for this patient
                                </div>
                            </div>
                    }
                </div>
                {
                    window.opener || (window.parent && window.parent !== window) ?
                    <nav className="navbar navbar-default navbar-fixed-bottom">
                        <div className="container-fluid" style={{ width: "100%" }}>
                            <div className="row">
                                <div className="col-xs-12" style={{ paddingTop: 8 }}>
                                    <DialogFooter/>
                                </div>
                            </div>
                        </div>
                    </nav> :
                    null
                }
            </div>
        )
    }
}

export default connect(state => state)(withParams(PatientDetail))
