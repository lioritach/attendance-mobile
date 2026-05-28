sap.ui.define([], function () {
    "use strict";
    return {
        stringToHours: function (value) {
            if (!value || value.length < 4){
                return value;
            }
            return value.substring(0,2) + ":" + value.substring(2,4);
        },
        isVisible: function(value){
            if (value === "" || value === null ||
                ( typeof value["ms"] === "number" && value["ms"] === 0) ){
                return false;
            }
            return true;
        }
    };
});