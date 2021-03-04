# FHIR Helm Chart

## Introduction

This [Helm](https://github.com/kubernetes/helm) chart installs the [Alvearie Patient Browser](https://github.com/Alvearie/patient-browser) app in a Kubernetes cluster. The Alvearie Patient Browser app is based on the [SMART on FHIR Patient Browser](https://github.com/smart-on-fhir/patient-browser)

## Pre-Requisites

- Kubernetes cluster 1.10+
- Helm 3.0.0+
- A running FHIR server (with the `$everything` operation)

## Installation

### Checkout the Code

Git clone this repository and `cd` into this directory.

```bash
git clone https://github.com/Alvearie/patient-browser
cd patient-browser/chart
```

### Install the Chart

Install the helm chart, setting the URL of your FHIR server.

**Important:**
- The FHIR server URL needs to be reachable from your browser, i.e. from your computer
- The FHIR server needs to be unauthenticated. There is a FHIR Proxy Chart that can remove the authentication of an IBM FHIR server. If running this Chart along the [Alvearie Health Patterns](https://github.com/Alvearie/health-patterns/tree/main/clinical-ingestion/helm-charts/alvearie-ingestion) chart the proxy is included there.

```bash
helm install fhir-ui . --set fhirServer=http://my-fhir-server/fhir-server/api/v4
```

### Using the Chart

Access your FHIR UI at: `http://<external-ip>/index.html`

## Uninstallation

To uninstall/delete the `fhir-ui` deployment:

```bash
helm delete fhir-ui
```

## Configuration

Each requirement is configured with the options provided by that Chart.
Please consult the relevant charts for their configuration options.

See `values.yaml`.

## Contributing

Feel free to contribute by making a [pull request](https://github.com/Alvearie/patient-browser/pull/new/master).

Please review the [Contributing Guide](https://github.com/Alvearie/health-patterns/blob/main/CONTRIBUTING.md) for information on how to get started contributing to the project.

## License
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0) 
