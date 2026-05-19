sap.ui.define(
  [
    "attendanceshabas/attendanceshabas/controller/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
  ],
  function (BaseController, Controller, JSONModel, Fragment) {
    "use strict";

    return BaseController.extend(
      "attendanceshabas.attendanceshabas.controller.Home",
      {
        onInit: function () {
          this._Page = this.getView().getContent()[0];
          
          
          this.oBundle = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();

          const oModel = new JSONModel({
            isCheckedIn: false,
            showEntryScreen: true,
            lastTime: "",
            location: "",
            navigation: [],
            DailyReport: {"Remark": "", 
                          "RemarkDef": this.oBundle.getText("DailyRemark"),
                          "Reason": "", 
                          "ReasonDef": this.oBundle.getText("DailyReasonSelect"),
                          "ReasonList": [{Reason: "1", Text: "First"},
                                        {Reason: "2", Text: "Second"},
                                        {Reason: "3", Text: "Third"}],
                          "Approve": false}
          });

          this.getView().setModel(oModel, "clockModel");
          this.getView().getModel("clockModel").refresh(false);
          this.loadFragments(this, "MobileMainScreen", this._Page);
        },

        onBeforeShow: function (oEvent) {
          var oButton = this.byId("animButton"); // וודא שיש ID לכפתור ב-XML

          oButton.addEventDelegate(
            {
              onmousedown: function () {
                // ברגע הלחיצה - מוסיפים את ה-class והוא מחליק ימינה
                oButton.addStyleClass("buttonMovedRight");
              },
              onmouseup: function () {
                // אופציונלי: אם רוצים שיחזור כשעוזבים את הלחיצה
                oButton.removeStyleClass("buttonMovedRight");
              },
            },
            this,
          );
        },
        onAnimatePress: function (oEvent) {
          this.loadFragments(this, "monthlyAttendance", this._Page);
          //var oButton = oEvent.getSource();

          // הוספת ה-Class שמפעיל את הטרנספורמציה
          //oButton.addStyleClass("buttonMovedRight");

          // אם רוצים שהכפתור יחזור אחרי שנייה, אפשר להשתמש ב-setTimeout
          /*
        setTimeout(function() {
            oButton.removeStyleClass("buttonMovedRight");
        }, 1000);
        */
        },
        changeMonthToHeb: function (month) {
          switch (month) {
            case "01":
              return this.oBundle.getText("January");
              break;
            case "02":
              return this.oBundle.getText("February");
              break;

            case "03":
              return this.oBundle.getText("March");
              break;

            case "04":
              return this.oBundle.getText("April");
              break;

            case "05":
              return this.oBundle.getText("May");
              break;

            case "06":
              return this.oBundle.getText("June");
              break;

            case "07":
              return this.oBundle.getText("July");
              break;

            case "08":
              return this.oBundle.getText("August");
              break;

            case "09":
              return this.oBundle.getText("September");
              break;

            case "10":
              return this.oBundle.getText("October");
              break;
            case "11":
              return this.oBundle.getText("November");
              break;
            case "12":
              return this.oBundle.getText("December");
              break;
          }
        },
        onHBoxPress: function (oEvent) {
          sap.m.MessageToast.show("ה-HBox נלחץ!");
          var oHBox = this.getView().byId("hbox-circle");
          var text = this.getView().byId("circle-enter");
          // בדיקה אם הקלאס כבר קיים
          if (oHBox.hasStyleClass("hbox-circle")) {
            oHBox.removeStyleClass("hbox-circle"); // הסרה
            oHBox.addStyleClass("hbox-circle-green");
            text.setText(this.oBundle.getText("exit"));
            const oModel = this.getView().getModel("clockModel");

            const bCheckedIn = oModel.getProperty("/isCheckedIn");
            const now = new Date();
            const sTime = now.toLocaleTimeString("he-IL", {
              hour: "2-digit",
              minute: "2-digit"
            });
            // קבלת מיקום
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                function (position) {
                  const lat = position.coords.latitude;
                  const lon = position.coords.longitude;

                  const locationText = `Lat: ${lat}, Lon: ${lon}`;

                  oModel.setProperty("/lastTime", sTime);
                  oModel.setProperty("/location", locationText);

                }.bind(this),
                function (error) {
                  oModel.setProperty("/lastTime", sTime);
                  oModel.setProperty("/location", "לא הצלחנו להביא מיקום");
                }.bind(this)
              );
            } else {
              oModel.setProperty("/lastTime", sTime);
              oModel.setProperty("/location", "המכשיר לא תומך במיקום");
            }

            this.getView().byId("hbox-clockTime").setVisible(true);


            oModel.setProperty("/isCheckedIn", !bCheckedIn);
            oModel.setProperty("/lastTime", sTime);
            this.getView().byId("hbox-clockTime").setVisible(true);
          } else {
            oHBox.removeStyleClass("hbox-circle-green");
            this.getView().byId("hbox-clockTime").setVisible(false);
            oHBox.addStyleClass("hbox-circle"); // הוספה
            text.setText(this.oBundle.getText("enter"));
          }
        },
        openMyMenu: async function () {
          this.loadFragments(this, "MyMenu", this._Page);
          //this.MyMenu = await this.loadFragment({
          //  name: "attendanceshabas.attendanceshabas.fragments.MyMenu",
          //});
          //this.MyMenu.open();
        },
        closeMyMenu: function () {
          this.loadFragments(this, "MobileMainScreen", this._Page);
          //this.MyMenu.close();
          //this.MyMenu.destroy();
          //this.MyMenu = null;
        },
        addCertificate: async function () {
          this.addCertificate = await this.loadFragment({
            name: "attendanceshabas.attendanceshabas.fragments.AddCertificate",
          });
          this.addCertificate.open();
        },

        closeAddCertificate: function () {
          this.addCertificate.close();
          this.addCertificate.destroy();
          this.addCertificate = null;
        },
        addReport: async function () {
          this.addReport = await this.loadFragment({
            name: "attendanceshabas.attendanceshabas.fragments.addReport",
          });
          this.addReport.open();
        },

        actionsPopup: function (oEvent) {
          var oButton = oEvent.getSource(),
            oView = this.getView();

          // create popover
          if (!this._pPopover) {
            this._pPopover = Fragment.load({
              id: oView.getId(),
              name: "attendanceshabas.attendanceshabas.fragments.ActionsPopup",
              controller: this,
            }).then(function (oPopover) {
              oView.addDependent(oPopover);
              // oPopover.bindElement("/ProductCollection/0");
              return oPopover;
            });
          }
          this._pPopover.then(function (oPopover) {
            oPopover.openBy(oButton);
          });
        },

        openCalendar: function (oEvent) {
          var oButton = oEvent.getSource(),
            oView = this.getView();

          // Create popover if it doesn't exist
          if (!this.oCalendarPopover) {
            this.oCalendarPopover = Fragment.load({
              id: oView.getId(), // Using the view's ID for unique fragment IDs
              name: "attendanceshabas.attendanceshabas.fragments.Calendar",
              controller: this,
            }).then(function (oPopover) {
              oView.addDependent(oPopover);
              return oPopover;
            });
          }

          // Open the calendar fragment when ready
          this.oCalendarPopover.then(function (oPopover) {
            oPopover.openBy(oButton);
          });
        },

        handleCalendarSelect: function (oEvent) {
          var selectedDates = oEvent.getSource().getSelectedDates()[0];
          var startDate = selectedDates.getStartDate().toLocaleDateString("he");
          var endDate = selectedDates.getEndDate();
          if (!endDate) {
            endDate = startDate;
          } else {
            endDate = selectedDates.getEndDate().toLocaleDateString("he");
          }
          this.getView()
            .byId("absenceDatesInput")
            .setValue(`${startDate} - ${endDate}`);
        },

        onMonthsPress: function (oEvent) {
          var oButton = oEvent.getSource(),
            oView = this.getView();

          // create popover
          if (!this.oMonthsPress) {
            this.oMonthsPress = Fragment.load({
              id: oView.getId(),
              name: "attendanceshabas.attendanceshabas.fragments.Months",
              controller: this,
            }).then(function (oPopover) {
              oView.addDependent(oPopover);
              // oPopover.bindElement("/ProductCollection/0");
              return oPopover;
            });
          }
          this.oMonthsPress.then(function (oPopover) {
            oPopover.openBy(oButton);
          });
        },

        openAttendanceUpdate: async function () {
          this.openAttendanceUpdate = await this.loadFragment({
            name: "attendanceshabas.attendanceshabas.fragments.AttendanceUpdate",
          });
          this.openAttendanceUpdate.open();
        },
        openDetailsEmp: async function () {
          if (this.getOwnerComponent().getModel("device").getData().system.phone){
            var name = "attendanceshabas.attendanceshabas.fragments.Mobile.MyDetails";
          }else{
            name = "attendanceshabas.attendanceshabas.fragments.MyDetails";
          }
          this.MyMenu = await this.loadFragment({
            name: name
          });
          this.MyMenu.open();
        },
        closeDetailsEmp: async function () {
          this.MyMenu.close();
          this.MyMenu.destroy();
          this.MyMenu = null;
        },

        onMenuItemPress: function (oEvent) {
          oEvent.getSource().removeSelections();
          const sRoute = oEvent.getParameter("listItem").data("route");

          this.loadFragments(this, sRoute, this._Page);
          //const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          //oRouter.navTo(sRoute);

          //this.closeMyMenu();
        },

//         _
//        | |
//        |_|
//        /_\    \ | /
//      .-"""------.----.
//      |          U    |
//      |               |
//      | ====o======== |
//      | ============= |
//      |               |
//      |_______________|
//      | ________GF337 |
//      ||   Welcome   ||
//      ||             ||
//      ||_____________||
//      |__.---"""---.__|
//      |---------------|
//      |[Yes][(|)][ No]|
//      | ___  ___  ___ |
//      |[<-'][CLR][.->]|
//      | ___  ___  ___ |
//      |[1__][2__][3__]|
//      | ___  ___  ___ |
//      |[4__][5__][6__]|
//      | ___  ___  ___ |
//      |[7__][8__][9__]|
//      | ___  ___  ___ |
//      |[*__][0__][#__]|
//      `--------------'
//      {__|""|_______'-
//      `---------------'        

        MobClockPress: function(oEvent){
          oEvent.getSource().removeSelections();

          

          var oModel = this.getView().getModel("clockModel");
          if (oModel.getProperty("/showEntryScreen")){
            var entry = true;
          }else{
            entry = false;
          }
          const now = new Date();
          const sTime = now.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit"
          });
          oModel.setProperty("/lastTime", sTime);      
          oModel.setProperty("/isCheckedIn", true);  

          this.MobSwitchClockScreen();
        },
        MobSwitchClockScreen(){
          var oModel = this.getView().getModel("clockModel");
          var circle = this.getView().byId("clockCircle");
          if (oModel.getProperty("/showEntryScreen")){
            circle.removeStyleClass("MobileClockCircle");
            circle.addStyleClass("MobileClockCircleExit");
            oModel.setProperty("/showEntryScreen", false);
          }else{
            circle.removeStyleClass("MobileClockCircleExit");
            circle.addStyleClass("MobileClockCircle");
            oModel.setProperty("/showEntryScreen", true);
          }
        },
        MobClockSwipe: function(oEvent){
          this.MobSwitchClockScreen();
        }
      },
    );
  },
);