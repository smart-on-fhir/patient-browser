/* global jdenticon */
import React from "react"
import {
    getPatientImageUri,
    getPatientName
} from "../../lib"

import "./PatientImage.less"

function hash(input) {
    let out = String(input).toLowerCase().trim().split("")
        .reduce((sum, c) => sum + c.charCodeAt(0).toString(16), "");
    while (out.length < 11) {
        out += out.length ? out : "000000000000"
    }
    return out;
}

export default class PatientImage extends React.Component
{
    static propTypes = {
        patient  : React.PropTypes.object.isRequired,
        className: React.PropTypes.string,
        style    : React.PropTypes.object,
        base     : React.PropTypes.string
    };

    static defaultProps = {
        base: ""
    };

    componentDidMount() {
        this.renderCanvas()
    }

    componentDidUpdate() {
        this.renderCanvas()
    }

    renderCanvas() {
        let url = getPatientImageUri(this.props.patient, this.props.base)
        if (!url) {
            let hex = hash(getPatientName(this.props.patient));
            jdenticon.update("#img-" + this.props.patient.id, hex, 0.1)
        }
    }

    render() {
        let { className, style, patient, base, ...rest } = this.props;
        let url = getPatientImageUri(patient, this.props.base);
        className = "patient-image-wrap " + (className || "")

        style = { ...(style || {}) }

        if (url) {
            style.backgroundImage = `url('${url}')`
            style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
        }

        return (
            <div className={className} style={style} {...rest}>
                {
                    url ?
                    null :
                    <canvas
                        width="480"
                        height="480"
                        style={{ width: "100%", height: "100%" }}
                        id={"img-" + patient.id}
                    />
                }
            </div>
        )
    }
}