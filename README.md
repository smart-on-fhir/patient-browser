# patient-browser

App to browse sample patients
[DEMO](https://patient-browser.smarthealthit.org/index.html)

## Quick installation

1. Clone this repository:

   ```sh
   git clone https://github.com/joundso/patient-browser.git patient-browser
   ```

2. Run [`start.sh`](./start.sh):

    ```sh
    sudo bash ./start.sh
    ```

3. Go to [`localhost:8080`](http://localhost:8080) (or whatever port you specified for `PORT_HTTP` in the [`.env`](./.env) file).
4. Finished :tada:

## Usage

The patient browser is standalone static html5 app living at <https://patient-browser.smarthealthit.org> that is supposed to be invoked in
dialog windows or iFrames giving you the ability to select patients. It would typically be rendered in a popup window but an iFrame inside a
layered dialog is often a preferred option. In any case, the patient browser will be in it's own window which will be in another domain,
thus the post messages are used for the cross-window communication.

The host app (the one that invokes the patient browser) can also "inject" some configuration to the patient browser to customize it.
Here is one commented example of how that works:

```js
/**
 * Opens the patient browser in popup window to select some patients
 * @param {String} selection (optional) Comma-separated list of patient IDs
 *                           to be pre-selected. This is a way to pass the
 *                           current selection (if any) that the host app
 *                           maintains. The user will see these IDs as selected
 *                           and will be able to make changes to the selection.
 * @return {Promise<String>} Returns a promise that will eventually be resolved
 *                           with the new selection.
 */
function selectPatients(selection) {
    return new Promise(function(resolve, reject) {

        // The origin of the patient browser app
        let origin = "https://patient-browser.smarthealthit.org";

        // What config file to load
        let config = "stu3-open-sandbox"

        // Popup height
        let height = 700;

        // Popup width
        let width  = 1000;

        // Open the popup
        let popup  = window.open(
            origin + (
                selection ?
                    `/index.html?config=${config}#/?_selection=${encodeURIComponent(selection)}` :
                    ""
            ),
            "picker",
            [
                "height=" + height,
                "width=" + width,
                "menubar=0",
                "resizable=1",
                "status=0",
                "top=" + (screen.height - height) / 2,
                "left=" + (screen.width - width) / 2
            ].join(",")
        );

        // The function that handles incoming messages
        const onMessage = function onMessage(e) {

            // only if the message is coming from the patient picker
            if (e.origin === origin) {

                // OPTIONAL: Send your custom configuration options if needed
                // when the patient browser says it is ready
                if (e.data.type === 'ready') {
                    popup.postMessage({
                        type: 'config',
                        data: {
                            submitStrategy: "manual",
                            // ...
                        }
                    }, '*');
                }

                // When the picker requests to be closed:
                // 1. Stop listening for messages
                // 2. Close the popup window
                // 3. Resolve the promise with the new selection (if any)
                else if (e.data.type === 'result' || e.data.type === 'close') {
                    window.removeEventListener('message', onMessage);
                    popup.close();
                    resolve(e.data.data);
                }
            }
        };

        // Now just wait for the user to interact with the patient picker
        window.addEventListener('message', onMessage);
    });
}

// onDOMReady (assuming that jQuery is available):
jQuery(function($) {

    // A button that will open the picker when clicked
    let button = $(".my-button");

    // An input that will display the selected patient IDs
    let input = $(".my-input");

    button.on("click", function() {
        let selection = input.val();
        selectPatients(selection).then(sel => {

            // ignore cancel and close cases
            if (sel || sel === "") {
                $("input", this).val(sel)
            }
        })
    })
});
```

## Configuration Options

The patient browser is designed to load external config file while starting. This way you can change the settings without having to re-build the app. Additionally, the app can be told which config file to load using an `config` get parameter like so:

**Official FHIR STU3 Picker:**
<https://patient-browser.smarthealthit.org/index.html?config=stu3-open-sandbox>

**Official FHIR DSTU2 Picker:**
<https://patient-browser.smarthealthit.org/index.html?config=dstu2-open-sandbox>

**HAPI FHIR STU3 Picker:**
<https://patient-browser.smarthealthit.org/index.html?config=stu3-open-hapi>

**HAPI FHIR DSTU2 Picker:**
<https://patient-browser.smarthealthit.org/index.html?config=dstu2-open-hapi>

If you need to support other servers you can just submit a pull request adding dedicated config file to this folder `/build/config`.
Note that these config files are in `json5` format which is like a loose version of JSON and you can even have comments inside it.

Any config file might contain the following options:

- `server` - an object describing the FHIR API server
  - `server.url` - The base URL of the FHIR API server to use. Note that the picker will only work with open servers that do not require authorization.
  - `server.type` - The FHIR version. Currently this can be `DSTU-2` or `STU-3` or `R4`.
  - `server.tags` - An array of tag objects to be rendered in the tags auto-complete menu. This defaults to an empty array and in that case the tag selection widget will not have a drop-down menu options but it will still allow you to search by typing some tag manually. In other words, using an empty array is like saying that we just don't know what tags (if any) are available on that server. The list of tags might look like this:
        ```js
        [
            {
                // The actual tag
                key  : "pro-5-2017",

                // The label to render in the tags auto-complete menu
                label: "PROm sample patients 5/2017"
            },
            {
                key  : "smart-5-2017",
                label: "SMART sample patients 5/2017"
            },
            {
                key  : "synthea-5-2017",
                label: "Synthea sample patients 5/2017"
            },
            // ...
        ]
        ```
        If your server does not have any tags then the tag selector widget will be useless and it is better if you hide it - see the `hideTagSelector` option below.
    - `server.conditions` - An object containing all the predefined medical conditions. Each condition is stored by it's unique key and has a shape similar to this one:

        ```js
        prediabetes: {
            description: 'Prediabetes',
            codes: {
                'SNOMED-CT': ['15777000']
            }
        }
        ```

        This is an empty object by default since we can't know what conditions are available on each server. We have that list pre-built for the smart sandbox servers but for the others you are expected to that yourself (see the Config Generator section below).

- `patientsPerPage` - Patients per page. Defaults to `10`.
- `timeout` - AJAX requests timeout in milliseconds. Defaults to `20000`.
- `renderSelectedOnly` - Only the selected patients are rendered. Should be false or the preselected patient IDs should be passed to the window. Otherwise It will result in rendering no patients at all. Defaults to `false`.
- `fhirViewer` - If `fhirViewer.enabled` is true (then `fhirViewer.url` and `fhirViewer.param` MUST be set) then clicking on the patient-related resources in detail view will open their source in that external viewer. Otherwise they will just be opened in new browser tab. Defaults to

    ```js
    {
        enabled: false,
        url    : "http://docs.smarthealthit.org/fhir-viewer/index.html",
        param  : "url"
    }
    ```

- `outputMode` - How to return the selection. Defaults to `id-list`. Options are:
  - `id-list`  - return the selection as comma-separated list of patient IDs.
  - `id-array` - return the selection as an array of patient IDs.
  - `patients` - return the selection as an array of patient JSON objects.
- `submitStrategy` - Defaults to `automatic`. Options are:
  - `automatic` - Submit on change and defer that in some cases
  - `manual`    - Render a submit button
- hideTagSelector - If there are no tags in the server  the tag selector will not be useful. You can hide the Tags tab by passing `true` here.

### Config Generator

Creating a config file might be a difficult task if you also want to have reliable  condition list. We have created a special command-line tool to help you with that.
It will expect you to provide a FHIR server base URL and a config name and will handle everything else.
Example, ran within the project directory:

```sh
cd config-genrator
node generate_config.js -s http://127.0.0.1:18300 -f my-test-config
```

This will do the following:

1. Connect to the specified open server provided with the `-s` or `--server` option.
2. Load the conformance statement and detect the FHIR version (`"DSTU-2"` or `"STU-3"` or `"R4"`).
3. Load all the conditions that are found ot that server.
4. Load config from `./build/config/my-test-config.json5` if it exists, where `my-test-config` comes from the `-f` or `--file` option. Otherwise use default config template.
5. Mix-in the FHIR version and the conditions.
6. Save the result to `./build/config/my-test-config.json5`.

The you can use it by adding a `config=my-test-config` to your query string.
Keep in mind that when using this tool tu update existing config file, the data will be updated properly bu any comments will be lost!

NOTE: If you don't provide the `-f` the result configuration will be printed to stdout.

## URL Options

Some of the options above plus some additional ones can be passed via the URL. The app recognizes two types of parameters - search parameters and hash parameters. The search parameters are those listed after the first `?` and hash parameters are listed after a `?` character that is preceded by a `#` character. In other words, the hash portion of the URL can have it's own query string portion.

### Search parameters

This can contain `config` parameter plus some of the config variable described above - `patientsPerPage`, `submitStrategy`, `hideTagSelector`.

The **config** option is the base name of the config file that should be loaded from `/build/config/`. Defaults to `stu3-open-sandbox`.

### Hash parameters

- `_tab` - Which tab to open by default. Can be `tags`, `conditions` or `demographics`. If missing the Demographics tab will be activated.
- `_selection` - Comma-separated list of patient IDs to be rendered as selected. Note that this is only evaluated once, while the picker is loading.
