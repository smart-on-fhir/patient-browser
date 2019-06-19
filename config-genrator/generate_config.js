#!/usr/bin/env node

require("colors");
const Path      = require("path");
const request   = require("request");
const FS        = require("fs");
const app       = require("commander");
const JSON5     = require("json5");
const mixinDeep = require("mixin-deep");

app
    .version('0.1.0')
    .option('-s, --server <string>', 'Fhir server base url')
    .option('-p, --proxy <string>' , 'Proxy (if needed)')
    .option('-f, --file <string>' , 'The name of the config file')
    .parse(process.argv);

if (!app.server) {
    return app.help();
}

/**
 * Promisified version of request. Rejects with an Error or resolves with the
 * response (use response.body to access the parsed body).
 * @param {Object} options The request options
 * @return {Promise<Object>}
 */
function requestPromise(options) {
    return new Promise((resolve, reject) => {
        let cfg = typeof options == "string" ? { uri: options } : options || {};
        request(
            Object.assign({}, cfg, {
                method   : "GET",
                json     : true,
                strictSSL: false,
                proxy    : app.proxy,
                headers  : {
                    accept: "application/json+fhir"
                }
            }),
            (error, res) => {
                if (error) {
                    return reject(error);
                }
                resolve(res);
            }
        );
    });
}

/**
 * Fetches the conformance statement and determines the Fhir version
 * @returns {Promise<String>} "DSTU-0", "DSTU-1", "DSTU-2", "STU-3" or "R4"
 * @see http://hl7.org/fhir/directory.html
 * TODO: Fixme when version 4 is out
 */
function getFhirVersion() {
    return requestPromise(app.server.replace(/\/?$/, "/metadata")).then(res => {
        return ({
            "0"      : "DSTU-0",
            "0.01"   : "DSTU-0",
            "0.05"   : "DSTU-1",
            "0.06"   : "DSTU-1",
            "0.11"   : "DSTU-1",
            "0.0.82" : "DSTU-1",
            "0.4.0"  : "DSTU-2",
            "0.5.0"  : "DSTU-2",
            "1.0.0"  : "DSTU-2",
            "1.0.2"  : "DSTU-2",
            "1.1.0"  : "STU-3",
            "1.2.0"  : "STU-3",
            "1.4.0"  : "STU-3",
            "1.6.0"  : "STU-3",
            "1.8.0"  : "STU-3",
            "3.0.1"  : "STU-3",
            "3.2.0"  : "R4",
            "3.3.0"  : "R4",
            "3.5.0"  : "R4",
            "3.5a.0" : "R4",
            "4.0.0"  : "R4"
        }[res.body.fhirVersion]) || "Unknown";
    });
}

/**
 * Given a fhir bundle finds it's link having the given rel attribute.
 * @param {Object} bundle FHIR JSON Bundle object
 * @param {String} rel The rel attribute to look for: prev|next|self... (see
 * http://www.iana.org/assignments/link-relations/link-relations.xhtml#link-relations-1)
 * @returns {String|null} Returns the url of the link or null if the link was
 *                        not found.
 */
function getBundleURL(bundle, rel) {
    let nextLink = bundle.link;
    if (nextLink) {
        nextLink = nextLink.find(l => l.relation === rel);
        return nextLink && nextLink.url ? nextLink.url : null
    }
    return null;
}

function getAllPages(options, cb, result = []) {
    request(options, (error, response, bundle) => {

        if (error) {
            throw error;
        }

        if (response.statusCode >= 400) {
            let err = new Error(response.statusMessage);
            err.details = bundle;
            throw err;
        }

        if (bundle.resourceType != "Bundle") {
            throw new Error("The query did not return a bundle");
        }

        let entries = (bundle.entry || []);
        if (entries.length) {


            entries.forEach(item => {
                if (item.fullUrl && result.findIndex(o => (o.fullUrl === item.fullUrl)) == -1) {
                    result.push(item);
                }
            });

            let pct = Math.floor(result.length / bundle.total * 100);
            if (!isNaN(pct)) {
                process.stdout.write(`\rCollecting conditions... ${pct}%`);
            }

            let nextUrl = getBundleURL(bundle, "next");
            if (nextUrl) {
                return getAllPages(Object.assign({}, options, { uri: nextUrl }), cb, result);
            }

            process.stdout.write("\n");
        }
        else {
            console.log("No conditions were found on this server!");
        }

        if (cb) {
            cb(result);
        }
    });
}

function generateConfig(fhirVersion, conditions = {}) {
    return {
        server: {
            type: fhirVersion,
            url: app.server,
            tags: [],
            conditions
        },
        patientsPerPage: 25,
        timeout: 20000,
        renderSelectedOnly: false,
        fhirViewer: {
            enabled: true,
            url    : "http://docs.smarthealthit.org/fhir-viewer/index.html",
            param  : "url"
        },
        outputMode: "id-list",
        submitStrategy: "manual"
    }
}



getFhirVersion().then(version => {
    getAllPages({
        method   : "GET",
        uri      : app.server.replace(/\/?$/, "/Condition?_elements=code").trim(),
        json     : true,
        strictSSL: false,
        proxy    : app.proxy,
        headers  : {
            accept: "application/json+fhir"
        }
    }, resources => {
        let conditions = {};

        resources.forEach(obj => {
            let c = obj.resource.code.coding[0];
            conditions[c.code] = {
                description: c.display,
                codes: {
                    'SNOMED-CT' : [c.code]
                }
            };
        });

        let json = generateConfig("");
        if (app.file) {

            let filePath = Path.resolve(__dirname, "../config/", `${app.file.replace(/(\.json5)?$/, ".json5")}`);

            if (FS.existsSync(filePath)) {
                mixinDeep(json, JSON5.parse(FS.readFileSync(filePath, "utf8")));
            }

            mixinDeep(json.server, { type: version, conditions });

            // Save file
            FS.writeFileSync(filePath, JSON5.stringify(json, null, 4), "utf8");
        }
        else {
            mixinDeep(json.server, { type: version, conditions });
            console.log(JSON5.stringify(json, null, 4));
        }
    });
});


