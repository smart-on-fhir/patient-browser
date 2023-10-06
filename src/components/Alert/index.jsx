import React     from "react";
import PropTypes from "prop-types";

const ICONS = {
    info   : "fa-solid fa-circle-info",
    warning: "fa-solid fa-circle-exclamation",
    danger : "fa-solid fa-triangle-exclamation",
    success: "fa-solid fa-thumbs-up"
};

export default class Alert extends React.Component
{
    static propTypes = {
        type    : PropTypes.oneOf(["info", "warning", "danger", "success"]),
        close   : PropTypes.bool,
        icon    : PropTypes.bool,
        children: PropTypes.any
    };

    static defaultProps = {
        type : "info",
        close: true,
        icon : true
    };

    render() {
        return (
            <div className="container-fluid" style={{ width: "100%" }}>
                <div className="row">
                    <div className="col-12">
                        <br/>
                        <div className={ "alert alert-" + this.props.type }>
                            {
                                this.props.close ?
                                <span
                                    aria-hidden="true"
                                    data-dismiss="alert"
                                    className="close"
                                    style={{ lineHeight: "1.2rem" }}
                                >&times;</span> :
                                null
                            }
                            {
                                this.props.icon ?
                                <i className={ICONS[this.props.type]} style={{
                                    marginRight: "1ex"
                                }}/> :
                                null
                            }
                            { this.props.children }
                        </div>
                        <br/>
                    </div>
                </div>
            </div>
        )
    }
}