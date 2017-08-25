import React       from "react"
import moment      from "moment"
import {
    getPath,
    getPatientName
} from "../../lib"

// START HELPERS ===============================================================

const id = o => <b className="text-muted">{o.id}</b>;

const text = o => {
    if (o.text && o.text.div) {
        return <div dangerouslySetInnerHTML={{ __html: o.text.div }}/>
    }
    return ""
};

const timeAgoRenderer = path => function TimeAgo(o) {
    let d = getPath(o, path);
    if (d) {
        return <span title={d}>{ moment(d).toNow(true) } ago</span>;
    }
    return "-";
};

// END HELPERS =================================================================

const DefaultSchema = [
    {
        label : "Resource ID",
        render: id
    },
    {
        label: "Text",
        render: text
    },
    {
        label: "Last Updated",
        render: timeAgoRenderer("meta.lastUpdated")
    }
];

const Person = [
    {
        label: "Identifier",
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
        label: "Name",
        render: getPatientName,
        defaultValue: "N/A"
    },
    {
        label: "Gender",
        path: "gender",
        defaultValue: "N/A"
    },
    {
        label: "Birth Date",
        path: "birthDate",
        defaultValue: "N/A"
    }
];

export default {
    default              : DefaultSchema,
    Practitioner         : Person,
    Patient              : Person//,
    // MedicationDispense   : [

    // ],
    // AllergyIntolerance   : DefaultSchema,
    // DocumentReference    : DefaultSchema,
    // Organization         : DefaultSchema,
    // Goal                 : DefaultSchema,
    // DiagnosticReport     : DefaultSchema,
    // Questionnaire        : DefaultSchema,
    // QuestionnaireResponse: DefaultSchema
};
