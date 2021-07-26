import * as React from "react"
import moment     from "moment"
import $          from "jquery"

/**
 * Returns the int representation of the first argument or the
 * "defaultValue" if the int conversion is not possible.
 * @param {number|string} x The argument to convert
 * @param {number} defaultValue The fall-back return value. This will be
 *                              converted to integer too.
 * @return {Number} The resulting integer.
 */
export function intVal(x, defaultValue = 0) {
    var out = parseInt(x + "", 10);
    if (isNaN(out) || !isFinite(out)) {
        out = intVal(defaultValue);
    }
    return out;
}

/**
 * Converts the argument to boolean value. "0" and "no" are recognized as false.
 * "1" and "yes" are recognized as true. Everything else is just !!var
 * @param {*} x The argument to convert
 * @returns {Boolean} The argument converted to boolean
 */
export function boolVal(x) {
    return (/^(false|0|no)$/i).test(String(x)) ?
        false :
        (/^(true|1|yes)$/i).test(String(x)) ?
            true :
            !!x;
}

/**
 * Given some input argument, this function tries to treat it like an error and
 * extract an error message out of it. Supported input types are:
 * - String
 * - Error
 * - AJAX JSON response
 * - FHIR JSON response
 * - Object map of error messages
 * @param {*} input The input to analyse
 * @param {String|JSX.Element} error(s)
 */
export function getErrorMessage(input) {
    if (input && typeof input == "string") {
        return input;
    }

    let out = "Unknown error"

    if (input && input instanceof Error) {
        out = String(input);
    }

    else if (input && input.responseJSON) {
        if (Array.isArray(input.responseJSON.issue) && input.responseJSON.issue.length) {
            out = input.responseJSON.issue.map(o => o.diagnostics || "-").join("\n")
        }
        else {
            out = (
                input.responseJSON.message ||
                input.responseJSON.error ||
                "Unknown error"
            )
        }
    }

    else if (input && input.responseText) {
        out = ( input.responseText + " - " + input.statusText) || "Unknown error"
    }

    else if (input && input.statusText) {
        if (input.statusText == "timeout") {
            out = "The server failed to respond in the desired number of seconds"
        }
        else {
            out = input.statusText || "Unknown error"
        }
    }

    if (out && typeof out == "object") {
        let out2 = []
        for (let key in (out)) {
            out2.push(React.createElement("li", { key }, out[key]));
        }
        return React.createElement("div", null, [
            "Multiple errors",
            React.createElement("ul", null, out2)
        ])
    }

    return String(out).replace(/(Error\:\s)+/, "Error: ");
}

/**
 * Walks thru an object (ar array) and returns the value found at the provided
 * path. This function is very simple so it intentionally does not support any
 * argument polymorphism, meaning that the path can only be a dot-separated
 * string. If the path is invalid returns undefined.
 * @param {Object} obj The object (or Array) to walk through
 * @param {String} path The path (eg. "a.b.4.c")
 * @returns {*} Whatever is found in the path or undefined
 */
export function getPath(obj, path = "") {
    return path.split(".").reduce((out, key) => out ? out[key] : undefined, obj)
}

export function compileQueryString(params) {
    let query = []

    for (let key in params) {
        let p = params[key]

        // If the parameter value is falsy (and other than 0) just don't include
        // it in the query
        if (!p && p !== 0) {
            continue;
        }

        // if the value is an array then include that parameter multiple times
        // with different values
        if (Array.isArray(p)) {
            p.forEach(v => {

                // skip falsy not 0 values same as above
                if (v || v === 0) {
                    query.push(
                        encodeURIComponent(key) + "="
                        + encodeURIComponent(v)
                    )
                }
            })
        }

        // Add normal param to the query string
        else {
            query.push(
                encodeURIComponent(key) + "="
                + encodeURIComponent(p)
            )
        }
    }

    return query.join("&")
}

export function parseQueryString(str) {
    let out = {};
    str = String(str || "").trim().split("?").pop();
    str.split(/&/).forEach(pair => {
        let tokens = pair.split("=")
        let key    = decodeURIComponent(tokens[0])
        if (key) {
            let value = decodeURIComponent(tokens[1] || "true")
            if (out.hasOwnProperty(key)) {
                if (!Array.isArray(out[key])) {
                    out[key] = [out[key]]
                }
                out[key].push(value)
            }
            else {
                out[key] = value
            }
        }
    })
    return out
}

export function setHashParam(name, value) {
    let query = location.hash.split("?")[1] || "";
    let hash  = location.hash.replace(/\?.*/, "");
    // console.warn(query)
    query = parseQueryString(query || "");
    if (value === undefined) {
        if (query.hasOwnProperty(name)) {
            delete query[name]
        }
    }
    else {
        query[name] = value
    }

    query = compileQueryString(query)
    location.hash = hash + (query ? "?" + query : "")
}

// Fhir parsing helpers --------------------------------------------------------

/**
 * Given an array of Coding objects finds and returns the one that contains
 * an MRN (using a code == "MR" check)
 * @export
 * @param {Object[]} codings Fhir.Coding[]
 * @returns {Object} Fhir.Coding | undefined
 */
export function findMRNCoding(codings) {
    if (Array.isArray(codings)) {
        return codings.find(coding => coding.code == "MR");
    }
}

/**
 * Given an array of identifier objects finds and returns the one that contains an MRN
 * @export
 * @param {Object[]} identifiers
 * @returns {Object}
 */
export function findMRNIdentifier(identifiers) {
    return identifiers.find(
        identifier => !!findMRNCoding(getPath(identifier, "type.coding"))
    );
}

/**
 * Given a patient returns his MRN
 * @export
 * @param {Object} patient
 * @returns {string}
 */
export function getPatientMRN(patient) {
    let mrn = null;

    if (Array.isArray(patient.identifier) && patient.identifier.length) {
        mrn = findMRNIdentifier(patient.identifier);
        if (mrn) {
            return mrn.value;
        }
    }

    return mrn;
}

/**
 * Extracts and returns a human-readable name string from FHIR patient object.
 * @param {Object} patient FHIR patient object
 * @returns {String} Patient's name or an empty string
 */
export function getPatientName(patient) {
    if (!patient) {
        return ""
    }

    let name = patient.name;
    if (!Array.isArray(name)) {
        name = [name];
    }
    name = name[0];
    if (!name) {
        return "";
    }

    let family = Array.isArray(name.family) ? name.family : [ name.family ];
    let given  = Array.isArray(name.given ) ? name.given  : [ name.given  ];
    let prefix = Array.isArray(name.prefix) ? name.prefix : [ name.prefix ];
    let suffix = Array.isArray(name.suffix) ? name.suffix : [ name.suffix ];

    return [
        prefix.map(t => String(t || "").trim()).join(" "),
        given .map(t => String(t || "").trim()).join(" "),
        family.map(t => String(t || "").trim()).join(" "),
        suffix.map(t => String(t || "").trim()).join(" ")
    ].filter(Boolean).join(" ");
}

/**
 * Given a FHIR patient object, returns the patient's phone number (or empty string).
 * Note that if the patient have multiple phones this will only return the first one.
 * @param {Object} patient FHIR patient object
 * @returns {String} Patient's phone or an empty string
 */
export function getPatientPhone(patient = {}) {
    let phone = (patient.telecom || []).find(c => c.system == "phone");
    return phone ? phone.value : "";
}

/**
 * Given a FHIR patient object, returns the patient's email (or an empty string).
 * Note that if the patient have multiple emails this will only return the first one.
 * @param {Object} patient FHIR patient object
 * @returns {String} Patient's email address or an empty string
 */
export function getPatientEmail(patient = {}) {
    let phone = (patient.telecom || []).find(c => c.system == "email");
    return phone ? phone.value || "" : "";
}

/**
 * Extracts and returns a human-readable address string from FHIR patient object.
 * @param {Object} patient FHIR patient object
 * @returns {String} Patient's address or an empty string
 */
export function getPatientHomeAddress(patient = {}) {
    let a = (patient.address || []);
    a = a.find(c => c.use == "home") || a[0] || {};
    var l = [a.line, a.postalCode, a.city, a.country]
        .map(x => String(x || "").trim())
        .filter(Boolean)
        .join(" ");
    return l ? l : a.text || "";
}

/**
 * Extracts and returns a human-readable age string from FHIR patient object.
 * @param {Object} patient FHIR patient object
 * @returns {String} Patient's age
 */
export function getPatientAge(patient) {
    let from  = moment(patient.birthDate);
    let to    = moment(patient.deceasedDateTime || undefined);
    let age   = to - from;

    let seconds = Math.round(age / 1000)
    if (seconds < 60) {
        return seconds + " second"
    }

    let minutes = Math.round(seconds / 60)
    if (minutes < 60) {
        return minutes + " minute"
    }

    let hours = Math.round(minutes / 60)
    if (hours < 24) {
        return hours + " hour"
    }

    let days = Math.round(hours / 24)
    if (days < 30) {
        return days + " day"
    }

    let months = Math.round(days / 30)
    if (months < 24) {
        return months + " month"
    }

    let years = Math.round(days / 365)
    return years + " year"
}

/**
 * Extracts and returns an URL pointing to the patient photo (or an empty string)
 * @param {Object} patient FHIR patient object
 * @returns {String} Patient's image URL
 */
export function getPatientImageUri(patient, base="") {
    let data = getPath(patient, "photo.0.data") || "";
    let url  = getPath(patient, "photo.0.url") || "";
    let type = getPath(patient, "photo.0.contentType") || "";
    if (url.indexOf("/") === 0) {
        url = base + "" + url;
    }
    let http = url && url.match(/^https?:\/\//);
    if (!http && data) {
        if (type && data.indexOf("data:") !== 0) {
            data = `data:${type};base64,${data}`;
        }
        url = data;
    }
    else if (type && !http) {
        url = `data:${type};base64,${url}`;
    }
    return url;
}

/**
 * Return the display text for the given CodeableConcept
 * @param {Object} concept CodeableConcept
 * @returns {String}
 */
export function getCodeableConcept(concept, defaultValue = "-") {
    return String(
        getPath(concept, "coding.0.display") ||
        getPath(concept, "coding.0.code") ||
        concept.text ||
        defaultValue
    );
}

/**
 * Some elements are of type `code` in older FHIR versions, but have been
 * converted to CodeableConcept in later versions
 * @param {String|Object} data Code or CodeableConcept
 * @returns {String}
 */
export function getCodeOrConcept(data, defaultValue = "-") {
    if (typeof data == "string") return data || defaultValue;
    return getCodeableConcept(data, defaultValue);
}

/**
 * Returns whether a codeOrConcept is the result of NLP insight
 * @param {Object} data Code or CodeableConcept
 * @returns {Boolean}
 */
export function codeIsNLPInsight(data) {
    return getPath(data, "coding.0.extension.0.url") == "http://ibm.com/fhir/cdm/insight/reference";
}

export const InsightSource = {
    NONE: "None",
    SELF: "Self",
    DOCUMENT: "Document"
}

/**
 * Gets the source type of an insight
 * @param {Object} data FHIR Resource
 * @returns {InsightSource}
 */
export function getInsightSource(data) {
    let processType = getProcessType(data)
    if (typeof processType != 'string') {
        return InsightSource.NONE;
    }
    let processTypeArr = processType.toLowerCase().split(" ");
    if (processTypeArr.includes("unstructured")) {
        return InsightSource.DOCUMENT;
    } else if (processTypeArr.includes("structured")) {
        return InsightSource.SELF;
    } else {
        // It's not good if this happens
        return InsightSource.NONE;
    }
}

/**
 * Gets the process type of an insight
 * @param {Object} data FHIR Resource
 * @returns {String}
 */
export function getProcessType(data) {
    // get data.meta.extension.*.extension.*
    // this would be one big getPath() call but we need to check all array indices
    let meta = getPath(data, "meta");
    if (meta) {
        let ext_outer = getPath(meta, "extension")
        if (ext_outer && Array.isArray(ext_outer)) {
            for (let item_outer in ext_outer) {
                if (getPath(ext_outer[item_outer], "url") == "http://ibm.com/fhir/cdm/insight/result") {
                    let ext_inner = getPath(ext_outer[item_outer], "extension")
                    if (ext_inner && Array.isArray(ext_inner)) {
                        for (let item_inner in ext_inner) {
                            // check if at the process type
                            if (getPath(ext_inner[item_inner], "url") == "http://ibm.com/fhir/cdm/StructureDefinition/process-type") {
                                // NOW we can check the insight source
                                return getPath(ext_inner[item_inner], "valueString");
                            }
                        }
                    }
                }
            }
        }
    }
    return null
}

/**
 * Gets path to the document an insight is based on
 * @param {Object} data FHIR Resource
 * @returns {String}
 */
export function getBasedOn(data) {
    // get data.meta.extension.*.extension.*
    // this would be one big getPath() call but we need to check all array indices
    let meta = getPath(data, "meta");
    if (meta) {
        let ext_outer = getPath(meta, "extension")
        if (ext_outer && Array.isArray(ext_outer)) {
            for (let item_outer in ext_outer) {
                if (getPath(ext_outer[item_outer], "url") == "http://ibm.com/fhir/cdm/insight/result") {
                    let ext_inner = getPath(ext_outer[item_outer], "extension")
                    if (ext_inner && Array.isArray(ext_inner)) {
                        for (let item_inner in ext_inner) {
                            // check if at the process type
                            if (getPath(ext_inner[item_inner], "url") == "http://ibm.com/fhir/cdm/insight/basedOn") {
                                // NOW we can check the insight source
                                return getPath(ext_inner[item_inner], "valueReference.reference");
                            }
                        }
                    }
                }
            }
        }
    }
    return null
}

/**
 * Gets the confidence of a document insight
 * @param {Object} data FHIR Resource
 * @returns {String}
 */
export function getConfidence(data) {
    let insightEntry = getInsightEntry(data)
    for (let ext in insightEntry) {
        if (getPath(insightEntry[ext], "url") == "http://ibm.com/fhir/cdm/insight/confidence") {
            let ext_inner = getPath(insightEntry[ext], "extension")
            for (let e in ext_inner) {
                if (getPath(ext_inner[e], "url") == "http://ibm.com/fhir/cdm/insight/confidence-score") {
                    return (getPath(ext_inner[e], "valueString"))
                }
            }
        }
    }
    return null
}

/**
 * Gets the covered text a document insight
 * @param {Object} data FHIR Resource
 * @returns {String}
 */
 export function getCoveredText(data) {
    let insightEntry = getInsightEntry(data)
    for (let ext in insightEntry) {
        if (getPath(insightEntry[ext], "url") == "http://ibm.com/fhir/cdm/insight/span") {
            let ext_inner = getPath(insightEntry[ext], "extension")
            for (let e in ext_inner) {
                if (getPath(ext_inner[e], "url") == "http://ibm.com/fhir/cdm/insight/covered-text") {
                    return (getPath(ext_inner[e], "valueString"))
                }
            }
        }
    }
    return null
}

/**
 * Gets the insight entry of a document insight
 * @param {Object} data FHIR Resource
 * @returns {Array}
 */
export function getInsightEntry(data) {
    // get data.meta.extension.*.extension.*
    // this would be one big getPath() call but we need to check all array indices
    let meta = getPath(data, "meta");
    if (meta) {
        let ext_outer = getPath(meta, "extension")
        if (ext_outer && Array.isArray(ext_outer)) {
            for (let item_outer in ext_outer) {
                if (getPath(ext_outer[item_outer], "url") == "http://ibm.com/fhir/cdm/insight/result") {
                    let ext_inner = getPath(ext_outer[item_outer], "extension")
                    if (ext_inner && Array.isArray(ext_inner)) {
                        for (let item_inner in ext_inner) {
                            // check if at the process type
                            if (getPath(ext_inner[item_inner], "url") == "http://ibm.com/fhir/cdm/insight/insight-entry") {
                                // NOW we can check the insight source
                                return getPath(ext_inner[item_inner], "extension");
                            }
                        }
                    }
                }
            }
        }
    }
    return null
}

/**
 * Given some input string (@input) and a string to search for (@query), this
 * function will highlight all the occurrences by wrapping them in
 * "<span class="search-match"></span>" tag.
 * @param {String} input The input string
 * @param {String} query The string to search for
 * @param {Boolean} caseSensitive Defaults to false
 * @returns {String} The input string with the matches highlighted
 */
export function searchHighlight(input, query, caseSensitive = false) {
    let s = String(input);
    let q = String(query);
    let x = s;

    if (!caseSensitive) {
        x = x.toLowerCase();
        q = q.toLowerCase();
    }

    let i = x.indexOf(q);

    if (i > -1) {
        return (
            s.substr(0, i) +
            `<span class="search-match">` +
            s.substr(i, q.length) +
            "</span>" +
            s.substr(i + q.length)
        );
    }

    return input;
}

/**
 * Uses searchHighlight() to generate and return a JSX.span element containing
 * the @html string with @search highlighted
 * @param {String} html The input string
 * @param {String} search The string to search for
 * @returns {JSX.span} SPAN element with the matches highlighted
 */
export function renderSearchHighlight(html, search) {
    return (
        <span dangerouslySetInnerHTML={{
            __html: search ? searchHighlight(html, search) : html
        }}/>
    )
}

/**
 * Given a fhir bundle fins it's link having the given rel attribute.
 * @param {Object} bundle FHIR JSON Bundle object
 * @param {String} rel The rel attribute to look for: prev|next|self... (see
 * http://www.iana.org/assignments/link-relations/link-relations.xhtml#link-relations-1)
 * @returns {String|null} Returns the url of the link or null if the link was
 *                        not found.
 */
export function getBundleURL(bundle, rel) {
    let nextLink = bundle.link;
    if (nextLink) {
        nextLink = nextLink.find(l => l.relation === rel);
        return nextLink && nextLink.url ? nextLink.url : null
    }
    return null;
}

export function request(options) {
    options = typeof options == "string" ? { url : options } : options || {};
    let cfg = $.extend(true, options, {
        headers: {
            Accept: "application/fhir+json"
        }
    })

    return new Promise((resolve, reject) => {
        // console.info("Requesting " + decodeURIComponent(cfg.url))
        $.ajax(cfg).then(
            resolve,
            xhr => {
                let message = getErrorMessage(xhr)
                if (message && typeof message == "string") {
                    return reject(new Error(message))
                }
                else {
                    return reject({ message })
                }
            }
        )
    })
}

export function getAllPages(options, result = []) {
    return request(options).then(bundle => {
        (bundle.entry || []).forEach(item => {
            if (item.fullUrl && result.findIndex(o => (o.fullUrl === item.fullUrl)) == -1) {
                result.push(item);
            }
        })
        let nextUrl = getBundleURL(bundle, "next");
        if (nextUrl) {
            return getAllPages({ ...options, url: nextUrl }, result);
        }
        return result;
    });
}
