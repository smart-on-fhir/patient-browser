var CFG = require("../config.js");


exports["selection"] = function(browser) {
    const Lib = require("../lib.js")(browser);

    const ELEM_ANY_PATIENT       = ".patient-search-results a"
    const ELEM_FIRST_PATIENT     = ELEM_ANY_PATIENT + ":nth-child(1)"
    const ELEM_SECOND_PATIENT    = ELEM_ANY_PATIENT + ":nth-child(2)"
    const ELEM_SELECTION_LABEL   = ".app-footer .dialog-buttons label"
    const ELEM_SELECTION_BUTTONS = ELEM_SELECTION_LABEL + " > .btn-group"
    const ELEM_SELECTION_SPAN    = ELEM_SELECTION_LABEL + " > span"

    browser.url(CFG.PICKER_URL);
    browser.useCss();

    // Wait to be rendered
    browser.waitForElementVisible(ELEM_ANY_PATIENT, 30000);

    // make sure nothing is selected initially
    browser.waitForElementNotPresent('.patient-search-results a.selected', CFG.TIMEOUT);
    browser.expect.element(ELEM_SELECTION_SPAN).text.to.equal("0 patients selected");
    browser.waitForElementNotPresent(ELEM_SELECTION_BUTTONS, CFG.TIMEOUT);
    browser.expect.element(ELEM_SELECTION_LABEL).to.have.attribute("disabled");

    // Select the first patient
    Lib.pause();
    browser.click(ELEM_FIRST_PATIENT + ' .patient-select-zone');
    browser.waitForElementPresent(ELEM_SELECTION_BUTTONS, CFG.TIMEOUT);
    browser.expect.element(ELEM_FIRST_PATIENT).to.have.attribute("class").which.contains("selected");
    browser.expect.element(ELEM_SELECTION_SPAN).text.to.equal("1 patient selected:");
    browser.expect.element(ELEM_SELECTION_LABEL).to.not.have.attribute("disabled");

    // Select the second patient
    Lib.pause();
    browser.click(ELEM_SECOND_PATIENT + ' .patient-select-zone');
    browser.waitForElementPresent(ELEM_SELECTION_BUTTONS, CFG.TIMEOUT);
    browser.expect.element(ELEM_SECOND_PATIENT).to.have.attribute("class").which.contains("selected");
    browser.expect.element(ELEM_SELECTION_SPAN).text.to.equal("2 patients selected:");

    // De-select the first patient
    Lib.pause();
    browser.click('.patient-search-results a:first-child .patient-select-zone');
    browser.expect.element(ELEM_FIRST_PATIENT).to.have.attribute("class").which.does.not.contain("selected");
    browser.expect.element(ELEM_SELECTION_SPAN).text.to.equal("1 patient selected:");

    // De-select the second patient
    Lib.pause();
    browser.click(ELEM_SECOND_PATIENT + ' .patient-select-zone');
    browser.waitForElementNotPresent(ELEM_SELECTION_BUTTONS, CFG.TIMEOUT);
    browser.waitForElementNotPresent('.patient-search-results a.selected', CFG.TIMEOUT);
    browser.expect.element(ELEM_SELECTION_SPAN).text.to.equal("0 patients selected");

    // select the first two patients
    Lib.pause();
    browser.click(ELEM_FIRST_PATIENT + ' .patient-select-zone');
    browser.click('.patient-search-results a:nth-child(2) .patient-select-zone');
    browser.waitForElementPresent(ELEM_SELECTION_BUTTONS, CFG.TIMEOUT);
    browser.expect.element(ELEM_FIRST_PATIENT).to.have.attribute("class").which.contains("selected");
    browser.expect.element('.patient-search-results a:nth-child(2)').to.have.attribute("class").which.contains("selected");
    browser.expect.element(ELEM_SELECTION_SPAN).text.to.equal("2 patients selected:");

    // Go to the next page and select one more patient
    Lib.pause();
    browser.click('a[href="#next"]');
    browser.waitForElementPresent(ELEM_ANY_PATIENT, CFG.TIMEOUT);

    // Go back to the first page
    Lib.pause();
    browser.click('a[href="#prev"]');
    browser.waitForElementPresent(ELEM_ANY_PATIENT, CFG.TIMEOUT);

    // Show selected only
    Lib.pause();
    browser.expect.element(ELEM_SELECTION_BUTTONS + ' > .btn:nth-child(1)').to.have.attribute("class").which.does.not.contain("active");
    browser.click(ELEM_SELECTION_BUTTONS +' > .btn:nth-child(1)');
    browser.expect.element(ELEM_SELECTION_BUTTONS + ' > .btn:nth-child(1)').to.have.attribute("class").which.contains("active");

    // Reset the selection
    Lib.pause();
    browser.click(ELEM_SELECTION_BUTTONS +' > .btn:nth-child(2)');
    browser.waitForElementNotPresent(ELEM_SELECTION_BUTTONS, CFG.TIMEOUT);
    browser.waitForElementNotPresent(ELEM_ANY_PATIENT + '.selected', CFG.TIMEOUT);
    browser.waitForElementPresent(ELEM_ANY_PATIENT, CFG.TIMEOUT);
    browser.expect.element(ELEM_SELECTION_SPAN).text.to.equal("0 patients selected");
    browser.elements("css selector", ELEM_ANY_PATIENT, function(result) {
        if (result.value.length <= 2) {
            Lib.pause();
            throw new Error("Not all patients shown after reset");
        }

        // Finish!
        Lib.pause();
        browser.end();
    });


};

// exports['@disabled'] = true;
