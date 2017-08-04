import React from "react";

const TYPES = React.PropTypes;

const ICONS = {
    info   : "fa fa-info-circle",
    warning: "fa fa-exclamation-circle",
    danger : "fa fa-exclamation-triangle",
    success: "fa fa-thumbs-up"
};

export default class Alert extends React.Component
{
    static propTypes = {
        type    : TYPES.oneOf(["info", "warning", "danger", "success"]),
        close   : TYPES.bool,
        icon    : TYPES.bool,
        children: TYPES.any
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
                    <div className="col-xs-12">
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