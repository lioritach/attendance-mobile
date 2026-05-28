sap.ui.define([
    "sap/m/Select",
    "sap/m/SelectRenderer"
], function (Select, SelectRenderer) {
    "use strict";

    return Select.extend("attendanceshabas.attendanceshabas.controller.SelectM", {

        metadata: {
            events: {
                selectionChange: {}   // allow the event in XML
            }
        },

        renderer: SelectRenderer,

        createPicker: function () {
            return Select.prototype.createPicker
                .apply(this, ["Popover"])
                .addStyleClass("MobileSelectPopover");
        },

        // forward event to base class
        onSelectionChange: function (oEvent) {
            this.fireSelectionChange(oEvent.getParameters());
            Select.prototype.onSelectionChange.apply(this, arguments);
        },
        onBeforeRendering: function () {
            const fnOriginal = this.ontouchstart;

            this.ontouchstart = function (oEvent) {
                if (oEvent && oEvent.cancelable === false) {
                    // Prevent UI5 from calling preventDefault on a non-cancelable event
                    oEvent.preventDefault = function () {};
                }

                if (fnOriginal) {
                    fnOriginal.apply(this, arguments);
                }
            };

            Select.prototype.onBeforeRendering.apply(this, arguments);
        }

    });
});