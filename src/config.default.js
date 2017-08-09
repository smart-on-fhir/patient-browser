export default {
    server: {
        type: "STU-3", // "DSTU-2" or "STU-3"

        // HSPC
        // url: "https://sb-fhir-dstu2.smarthealthit.org/api/smartdstu2/open",
        url: "https://sb-fhir-stu3.smarthealthit.org/smartstu3/open",

        // HAPI
        // url: "http://fhirtest.uhn.ca/baseDstu3",
        // url: "http://fhirtest.uhn.ca/baseDstu2",

        // MiHIN
        // url: "http://34.195.196.20:9074/smartstu3",
        // url: "http://52.90.126.238:8080/fhir/baseDstu3",

        // Other
        // url: "http://sqlonfhir-dstu2.azurewebsites.net/fhir",
        // url: "https://stub-dstu2.smarthealthit.org/api/fhir",

        conditions: {},

        tags: []
    },

    hideTagSelector: false,

    patientsPerPage: 25,

    // AJAX requests timeout
    timeout: 20000,

    // Only the selected patients are rendered. Should be false or the
    // preselected patient IDs should be passed to the window. Otherwise
    // It will result in rendering no patients at all.
    renderSelectedOnly: false,

    // If enabled is true (then url and param MUST be set) then clicking on the
    // patient-related resources in detail view will open their source in that
    // external viewer. Otherwise they will just be opened in new browser tab.
    fhirViewer: {
        enabled: true,
        url    : "http://docs.smarthealthit.org/fhir-viewer/index.html",
        param  : "url"
    },

    // What to send when the OK dialog button is clicked. Possible values:
    // "id-list"  - comma-separated list of patient IDs (default)
    // "id-array" - array of patient IDs
    // "patients" - array of patient JSON objects
    outputMode: "id-list",

    // "automatic" -> onChange plus defer in some cases
    // "manual" -> render a submit button
    submitStrategy: "manual"
}
