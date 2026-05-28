/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "attendanceshabas/attendanceshabas/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("attendanceshabas.attendanceshabas.Component", {
            metadata: {
                interfaces: ["sap.ui.core.IAsyncContentCreation"],
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                const originalAddEventListener = EventTarget.prototype.addEventListener;

                EventTarget.prototype.addEventListener = function (type, listener, options) {
                    if (type === "touchstart" || type === "touchmove" || type === "touchend") {
                        const wrapped = function (event) {
                            if (event.cancelable === false) {
                                event.preventDefault = function () {};
                            }
                            return listener.call(this, event);
                        };
                        return originalAddEventListener.call(this, type, wrapped, options);
                    }
                    return originalAddEventListener.call(this, type, listener, options);
                }
            },
        });
    }
);