import React       from "react"
import { getPath } from "../../../lib"
import { connect } from "react-redux"

/**
 * Renders group of resources in a grid (table) where each component represents
 * one row...
 */
export class Grid extends React.Component
{
    static propTypes = {
        rows    : React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        cols    : React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        settings: React.PropTypes.object.isRequired,
        title   : React.PropTypes.string
    };


    renderResource(res, i)
    {
        let url = `${this.props.settings.server.url}/${res.resourceType}/${res.id}`;
        if (this.props.settings.fhirViewer.enabled) {
            url = this.props.settings.fhirViewer.url +
                (this.props.settings.fhirViewer.url.indexOf("?") > -1 ? "&" : "?") +
                this.props.settings.fhirViewer.param + "=" +
                encodeURIComponent(url);
        }

        return (
            <tr
                key={i}
                onClick={ () => window.open(url, "_blank") }
                style={{ cursor: "pointer" }}
            >
                {
                    this.props.cols.map((col, i) => {
                        let { render, path, cellProps, defaultValue } = col
                        cellProps = { ...cellProps, key: i }
                        if (typeof render == "function") {
                            return (
                                <td {...cellProps}>
                                    { render(res) }
                                </td>
                            )
                        }
                        return (
                            <td {...cellProps}>
                                {
                                    getPath(res, path) ||
                                    <small className="text-muted">{ defaultValue || "-" }</small>
                                }
                            </td>
                        )
                    })
                }
            </tr>
        )
    }

    render()
    {
        return (
            <div className="panel panel-default">
                {
                    this.props.title ?
                    <div className="panel-heading">
                        <b className="text-primary">
                            <i className="fa fa-address-card-o"/> { this.props.title }
                        </b>
                    </div> :
                    null
                }
                <table className="table table-condensed table-hover table-striped">
                    <thead>
                        <tr>
                            {
                                this.props.cols.map((col, i) => {
                                    let { headerProps, label } = col
                                    headerProps = { ...headerProps, key: i }
                                    return (
                                        <th {...headerProps}>
                                            { label || "" }
                                        </th>
                                    )
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        { this.props.rows.map(this.renderResource.bind(this)) }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default connect(state => ({
    settings: state.settings
}))(Grid);
