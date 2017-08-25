import React  from "react"
import moment from "moment"
import Grid   from "./Grid"
import Date   from "./Date"
import {
    getPath,
    getPatientName
} from "../../lib"

export default class Person extends React.Component
{
    static propTypes = {
        resources: React.PropTypes.arrayOf(React.PropTypes.object),
        title    : React.PropTypes.string
    };

    static defaultProps = {
        title: "Person"
    };

    render()
    {
        return (
            <Grid
                rows={ (this.props.resources || []).map(o => o.resource) }
                title={ this.props.title }
                comparator={(a,b) => {
                    let dA = getPath(a, "birthDate");
                    let dB = getPath(b, "birthDate");
                    dA = dA ? +moment(dA) : 0;
                    dB = dB ? +moment(dB) : 0;
                    return dB - dA;
                }}
                cols={[
                    {
                        label: <b><i className="glyphicon glyphicon-bookmark"/> Identifier</b>,
                        render: rec => {
                            let rows = [
                                <tr key="id">
                                    <td className="label-cell">ID</td>
                                    <td>{rec.id}</td>
                                </tr>
                            ]

                            if (Array.isArray(rec.identifier)) {
                                rows = rows.concat(rec.identifier.map(o => {
                                    let code = getPath(o, "type.coding.0.display") ||
                                               getPath(o, "type.text") ||
                                               getPath(o, "type.coding.0.code") ||
                                               String(getPath(o, "system") || "").split(/\b/).pop();
                                    if (!code) return null;
                                    return (
                                        <tr key={code}>
                                            <td className="label-cell">{code}</td>
                                            <td>{o.value}</td>
                                        </tr>
                                    )
                                }).filter(Boolean))
                            }

                            return (
                                <table>
                                    <tbody>{ rows }</tbody>
                                </table>
                            );
                        }
                    },
                    {
                        label: <b><i className="glyphicon glyphicon-user"/> Name</b>,
                        render: getPatientName,
                        defaultValue: "N/A"
                    },
                    {
                        label: <b><i className="fa fa-venus-mars"/> Gender</b>,
                        path: "gender",
                        defaultValue: "N/A"
                    },
                    {
                        label: <b><i className="glyphicon glyphicon-time"/> Birth Date</b>,
                        path: "birthDate",
                        defaultValue: "N/A",
                        render: o => <Date moment={o.birthDate}/>
                    }
                ]}
            />
        );
    }
}