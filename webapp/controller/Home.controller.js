sap.ui.define(
  [
    "attendanceshabas/attendanceshabas/controller/BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../model/formatter"
  ],
  function (BaseController, Controller, JSONModel, Fragment, formatter) {
    "use strict";

    return BaseController.extend(
      "attendanceshabas.attendanceshabas.controller.Home",
      {
        onInit: function () {
          this._Page = this.getView().getContent()[0];
          
          
          this.oBundle = this.getOwnerComponent()
            .getModel("i18n")
            .getResourceBundle();

          var currentHour = new Date().getHours();
          if (currentHour < 12) {
            var greeting = this.oBundle.getText("GoodMorning");
          } else if (currentHour < 18) {
            greeting = this.oBundle.getText("GoodAfternoon");
          } else {
            greeting = this.oBundle.getText("GoodEvening");
          }  

          const oModel = new JSONModel({
            isCheckedIn: false,
            showEntryScreen: true,
            lastTime: "",
            location: "",
            Employee: {},
            greeting: greeting,
            navigation: [],
            ReasonsList: [],
            Entries: [],
            DailyReport: {"Remark": "", 
                          "RemarkDef": this.oBundle.getText("DailyRemark"),
                          "Reason": "", 
                          "ReasonDef": this.oBundle.getText("DailyReasonSelect"),
                          "Approve": false},
            MonthlyReport: {"Attendance": [],
                          "AttendanceTotals":{},
                          "Balance": [],
                          "AttFilter": [{"key": 1, "text": this.oBundle.getText("MyReports")},
                                        {"key": 2, "text": this.oBundle.getText("Errors"), "count": 0},
                                        {"key": 3, "text": this.oBundle.getText("MyAbcenses"), "count": 0}],
                          "Sort": false,
                          "ShowTotalPanel": false,                                        
                          "Approve": false},
            AnsenceReport: {"Reason": "",
                            "ReasonDef": this.oBundle.getText("AbsenceReasonSelect"),
                            "Absence": {"ReportHours" : false,
                                        "ReportFullDays" : false,
                                        "CompleteDay" : false,
                                        "PeriodReport" : false,
                                        "ManagerApprove" : false,
                                        "AdministratorApprove" : false,
                                        "AddFile" : false,
                                        "ReportComment" : false,
                                        "AdditionalAbsenceData" : false},
                            "Period": null,
                            "PeriodDef": this.oBundle.getText("AbsencePeriod"),
                            "Hours": "",
                            "HoursDef": this.oBundle.getText("AbsenceHours"),
                            "Attachment": {},
                            "AttachmentDef": this.oBundle.getText("AbsenceAttachment"),
                            "Remark": "",
                            "RemarkDef": this.oBundle.getText("DailyRemark"),
                            
                            "Approve": false},              
            WorkArrangement: {"Month": true,
                              "Week": false}                                        
          });

          this.getView().setModel(oModel, "clockModel");
          this.getView().getModel("clockModel").refresh(false);

          this.MobInitData();
          
          
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

          var oModel = this.getView().getModel("clockModel");
          var sRoute = oEvent.getParameter("listItem").data("route");
          if (sRoute){
            this.loadFragments(this, sRoute, this._Page);
          }
          sRoute = oEvent.getParameter("listItem").data("itemAction");
          if (sRoute){
            var popover = oEvent.getParameter("listItem").getParent().getParent();
            if (popover){
              var item = popover._oOpenBy.getParent().getBindingContext("clockModel").getObject();
              popover.close();
              oModel.setProperty("/DailyItem", item);
              var editPath = popover._oOpenBy.getParent().getBindingContext("clockModel").sPath;
              switch(sRoute){
                case "EditMonthlyEntrie":
                  item.Editable = true;
                  oModel.setProperty(editPath, item);
                  oModel.refresh(false);
                  break;
                case "DeleteMonthlyEntrie":
                  break;
                case "ViewMonthlyEntrie":
                  this.OpenDialogScreen.call(this, "DailySummaryDetails");
                  break;

              }
            }
          }
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
        MobInitData: function(){
          var oModel = this.getView().getModel("clockModel");
          this.loadFragments(this, "MobileMainScreen", this._Page);

          var model = this.getOwnerComponent().getModel();
          model.read("/GetReasonsSet", {
            success: function(oData){
              oModel.setProperty("/ReasonsList", oData.results);
            },
            error: function(oEvent){debugger;}
          });
          var currPeriod = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMM", calendarType: 'Gregorian'}).format(new Date());
          this.MobReadAttendanceData(currPeriod);
        },

        MobReadAttendanceData: function(iPeriod){
          var oModel = this.getView().getModel("clockModel");
          var model = this.getOwnerComponent().getModel();

          model.read("/GetInfoEmpSet", {
            urlParameters: {
              "$expand": "ApproveAbsenceNav,ApproveIlnesNav,MonthNav,TitleDataNav,AttAbsNav,BalanceNav"
            },
            filters: [new sap.ui.model.Filter("IvPeriod", "EQ", iPeriod)],
            success: function(oData){
              var employee = oData.results[0].TitleDataNav.results[0];
              employee.FirstName = employee.Name.substring(0, employee.Name.indexOf(' ')); 
              employee.LastName = employee.Name.substring(employee.Name.indexOf(' ') + 1); 
              oModel.setProperty("/Employee", employee);

              var att = [];
              var balance = [];
              var totalErrors = 0;
              var totalAbsence = 0;
              for (var i = 0; i < oData.results[0].AttAbsNav.results.length; i++){
                var dailyItem = structuredClone(oData.results[0].AttAbsNav.results[i]);
                
                if (oData.results[0].AttAbsNav.results[i].Datum === null){
                  oModel.setProperty("/MonthlyReport/AttendanceTotals", dailyItem);
                }else{
                  dailyItem.Error = false;
                  dailyItem.Absence = false;
                  dailyItem.Editable = false;
                  if (dailyItem.Trriger1 !== "0.00"){
                    dailyItem.Error = true;
                    totalErrors++;
                  }
                  if (att.length > 0 && att[att.length - 1].Datum.getDate() === dailyItem.Datum.getDate()){
                    att[att.length - 1].Entries.push(dailyItem);
                  }else{
                    var flatItem = structuredClone(dailyItem);
                    flatItem.Entries = [];
                    flatItem.Entries.push(dailyItem);
                    att.push(flatItem);
                  }
                }
              }

              for (i = 0; i < oData.results[0].BalanceNav.results.length; i++){
                var balanceItem = oData.results[0].BalanceNav.results[i];
                if (balanceItem.Highlight){
                  var headerBalance = structuredClone(balanceItem);
                }else{
                  balance.push({"Reason": balanceItem.Field1, 
                            "Text1": headerBalance.Field2, "Value1": balanceItem.Field2,
                            "Text2": headerBalance.Field3, "Value2": balanceItem.Field3,
                            "Text3": headerBalance.Field4, "Value3": balanceItem.Field4,
                            "Text4": headerBalance.Field5, "Value4": balanceItem.Field5,
                            "Text5": headerBalance.Field6, "Value5": balanceItem.Field6});
                }               
              }
              oModel.setProperty("/MonthlyReport/Attendance", att);
              oModel.setProperty("/MonthlyReport/AttFilter/1/count", totalErrors);
              oModel.setProperty("/MonthlyReport/AttFilter/2/count", totalAbsence);
              oModel.setProperty("/MonthlyReport/Balance", balance);
              oModel.refresh(false);
            },
            error: function(oEvent){debugger;}
          });
        },

        MobOnMonthChange: function(oEvent){
          var that = this;
          var picker = new sap.m.DatePicker({
            displayFormat: "yyyyMM",
            valueFormat: "yyyyMM",
            change: function(oEvent){
              var period = oEvent.getParameter("value");
              if (period !== ""){
                that.MobReadAttendanceData(period);
              }
            }
          });
          
          picker.openBy(oEvent.getSource());
          picker._oPopup.addStyleClass("MobileDetailsDialog");
          picker._oPopup._oCloseButton.addStyleClass("MobileButtonMenu");
          picker._oPopup._oControl._header.addStyleClass("MobileCalendarDialogBody")
          picker._oCalendar.addStyleClass("MobileCalendarMonth")
        },

        MobClockPress: function(oEvent){
          oEvent.getSource().removeSelections();

  
          var oModel = this.getView().getModel("clockModel");
          if (oModel.getProperty("/showEntryScreen")){
            var entry = true;
            var event = "P10";
          }else{
            entry = false;
            event = "P20";
          }
          const now = new Date();
          const sTime = now.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit"
          });
          oModel.setProperty("/lastTime", sTime);      
          oModel.setProperty("/isCheckedIn", true);

          this.showMessage("Test111", "Warning");

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
        },
        MobReasonSelect: function(oEvent){
          //oEvent.getSource().removeSelections();
          
          var item = oEvent.getParameter("listItem").getBindingContext("clockModel").getObject();
          var oModel = this.getView().getModel("clockModel");
          oModel.setProperty("/DailyReport/Reason", item.Code);
          oEvent.getSource().getParent().getParent().setExpanded(false);
          oEvent.getSource().getParent().getParent().setHeaderText(item.TextCode);
          if (oModel.getProperty("/DailyReport/Reason") !== "" && oModel.getProperty("/DailyReport/Remark") !== ""){
            oModel.setProperty("/DailyReport/Approve", true);
          }
        },
        MobDailyRemarkChange: function(oEvent){
          var oModel = this.getView().getModel("clockModel");
          if (oModel.getProperty("/DailyReport/Reason") !== "" && oModel.getProperty("/DailyReport/Remark") !== ""){
            oModel.setProperty("/DailyReport/Approve", true);
          }
        },
        
        MobDailyApprove: function(oEvent){
          var oModel = this.getView().getModel("clockModel");


          oModel.setProperty("/DailyReport/Approve", false);
          oModel.setProperty("/DailyReport/Reason", "");
          oModel.setProperty("/DailyReport/Remark", "");
          oModel.setProperty("/DailyReport/RemarkDef", this.oBundle.getText("DailyRemark"));
          oModel.setProperty("/DailyReport/ReasonDef", this.oBundle.getText("DailyReasonSelect"));
          oModel.refresh(false);

          this.onBack();
        },
        MobMonthlyAttendListFilter: function(oEvent){
          var aFilters = [];
          switch (oEvent.getParameter("selectedItem").getKey()){
            case "1":
              break;
            case "2":
              aFilters.push(new sap.ui.model.Filter("Error", "EQ", true));
              break;
            case "3":
              aFilters.push(new sap.ui.model.Filter("Absence", "EQ", true));
              break;    
          }
          oEvent.getSource().getParent().getParent().getBinding("items").filter(aFilters);
        },
        MobMonthlyAttendListSort: function(oEvent){
          var oModel = this.getView().getModel("clockModel");
          var sort = !oModel.getProperty("/MonthlyReport/Sort");
          oEvent.getSource().getParent().getParent().getBinding("items").sort(new sap.ui.model.Sorter("Datum", sort));
          oModel.setProperty("/MonthlyReport/Sort", sort);
        },
        MobOnMonthlyReportDay: function(oEvent){
          oEvent.getSource().removeSelections();
          var entries = oEvent.getParameter("listItem").getBindingContext("clockModel").getObject().Entries;
          if (entries.length){
            this.getView().getModel("clockModel").setProperty("/Entries", entries);
            this.getView().getModel("clockModel").refresh(false);
            this.MobOpenEntriesDetails();
          }
        },
        MobMonthlyReasonSelect: function(oEvent){
          var item = oEvent.getParameter("listItem").getBindingContext("clockModel").getObject();
          var oModel = this.getView().getModel("clockModel");
          oModel.setProperty("/AnsenceReport/Reason", item.Code);
          oModel.setProperty("/AnsenceReport/Absence", item);
          oEvent.getSource().getParent().getParent().setExpanded(false);
          oEvent.getSource().getParent().getParent().setHeaderText(item.TextCode);
          if (oModel.getProperty("/AnsenceReport/Reason") !== "" && oModel.getProperty("/AnsenceReport/Remark") !== ""){
            oModel.setProperty("/AnsenceReport/Approve", true);
          }
        },
        MobOpenEntriesDetails: async function () {
          this.OpenDialogScreen.call(this, "EntriesDetails");
        },
        
        MobOnEntriesDetailsMenu: function(oEvent){
          this.OpenActionMenu("EntriesDetailsMenu", oEvent.getSource());
        },
        MobOnMonthlyItemMenu: function(oEvent){
          this.OpenActionMenu("MonthlyItemMenu", oEvent.getSource());
        },
        MobMonthlyAttendActions: function(oEvent){
          this.OpenActionMenu("MonthlyHeaderMenu", oEvent.getSource());
        },
        MobOnWorkArrangementSwitch: function(oEvent){
          var key = oEvent.getParameter("item").getKey();
        },
        MobToMontlyReportTotalanel: function(oEvent){
          var oModel = this.getView().getModel("clockModel");
          oModel.setProperty("/MonthlyReport/ShowTotalPanel", !oModel.getProperty("/MonthlyReport/ShowTotalPanel"));
          oModel.refresh(false);
        },
        MobAbsenceCalendarSelect: function(oEvent){
          
        }
      },
    );
  },
);