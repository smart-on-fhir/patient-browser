var CFG  = require("./config.js");


module.exports = function(browser) {

    function pause(n) {
        browser.pause(n === undefined ? CFG.PAUSE : n);
    }

    function setTextInputValue(selector, value) {
        // browser.moveTo(selector, 0, 0);
        // browser.click(selector);
        pause(20);
        browser.clearValue(selector);
        pause(20);
        browser.setValue(selector, value);
        pause(20);
    }

    return {
        pause,
        setTextInputValue
    };
};