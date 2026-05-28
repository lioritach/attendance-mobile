sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../model/formatter"
  ],
  function (Controller, JSONModel, Fragment, formatter) {
    "use strict";

    return Controller.extend(
      "attendanceshabas.attendanceshabas.controller.BaseController",
      {
        loadFragments: function(that, FragmentName, target){
          var oView = that.getView();
          if (that.getOwnerComponent().getModel("device").getData().system.phone){
            var name = "attendanceshabas.attendanceshabas.fragments.Mobile."+ FragmentName;
          }else{
            var name = "attendanceshabas.attendanceshabas.fragments.Mobile."+ FragmentName;
          }
          var fragmentFound = false;
          for (var i = 0; i < target.getContent().length; i++){
            if (target.getContent()[i]._fragmentName === FragmentName){
              target.getContent()[i].setVisible(true);
              fragmentFound = true;
              var frameId = target.getContent()[i].sId;
            }else{
              target.getContent()[i].setVisible(false);
            }
          }
          if (!fragmentFound){
            that.loadFragment({
                name: name
            }).then(function(fragment) {
                  oView.addDependent(fragment);
                  fragment._fragmentName = FragmentName;
                  target.addContent(fragment);
                  frameId = fragment.sId;
            }.bind(that));  
          } 
          var navigation = that.getView().getModel("clockModel").getProperty("/navigation");
          navigation.push({fragmentName: FragmentName, targetId: target.sId, fragmentId: frameId});
          that.getView().getModel("clockModel").setProperty("/navigation", navigation);
                
        },
        onBack: function(oEvent){
          var navigation = this.getView().getModel("clockModel").getProperty("/navigation");
          navigation.splice(navigation.length - 1, 1);
          this.getView().getModel("clockModel").setProperty("/navigation", navigation);
          var prevScreen = navigation[navigation.length - 1];

          this.loadFragments(this, prevScreen.fragmentName, this._Page);
          navigation = this.getView().getModel("clockModel").getProperty("/navigation");
          navigation.splice(navigation.length - 1, 1);
          this.getView().getModel("clockModel").setProperty("/navigation", navigation);
        },
        OpenDialogScreen: function(fragmentName){
          var oView = this.getView();
          if (this.getOwnerComponent().getModel("device").getData().system.phone){
            var name = "attendanceshabas.attendanceshabas.fragments.Mobile." + fragmentName;
          }else{
            name = "attendanceshabas.attendanceshabas.fragments." + fragmentName;
          }
          this.loadFragment({
                name: name
            }).then(function(dialog) {
                  oView.addDependent(dialog);
                  //this._Page.addContent(dialog);  
                  dialog.open();               
            }.bind(this));  
        },
        CloseDialogScreen: async function (oEvent) {
          var parent = oEvent.getSource().getParent();
          do{
            if (parent.getMetadata().getName() === 'sap.m.Dialog'){
              var dialog = parent;
              
            }else if (parent.getMetadata().getName() === 'sap.m.Page'){ 
              return; 
            }else{
              parent = parent.getParent();
            }
          }while (dialog === undefined);
          if (dialog){}
            this.getView().removeDependent(dialog);
            dialog.close();
            dialog.destroy();
            dialog = null;
        },
        OpenActionMenu: function(menuName, source){
            if (this.getOwnerComponent().getModel("device").getData().system.phone){
              var name = "attendanceshabas.attendanceshabas.fragments.Mobile." + menuName;
            }else{
              name = "attendanceshabas.attendanceshabas.fragments." + menuName;
            }
            var oView = this.getView();
            Fragment.load({
              name: name,
              controller: this
            }).then(function(oMenu) {
              oView.addDependent(oMenu);
              oMenu.openBy(source);
              return oMenu;
            }.bind(this));
        },
        MobExpandPanelRemark: function(oEvent){
          if (!oEvent.getParameter("expand") && oEvent.getSource().getContent()[0].getValue() !== ""){
            oEvent.getSource().setHeaderText(oEvent.getSource().getContent()[0].getValue());
          }
        },
        MobOnPanelExpand: function(oEvent){
          if (oEvent.getParameter("triggeredByInteraction")){
            var items = oEvent.getSource().getParent().getItems();
            for ( var i = 0; i < items.length; i++){
              if (items[i].getMetadata().getName() === "sap.m.Panel"){
                
                  if (items[i].getExpanded() || items[i].sId === oEvent.getSource().sId){
                    if ( items[i].sId !== oEvent.getSource().sId){
                      items[i].setExpanded(false);
                    }
                    var content = this.getContentList(items[i]);
                    for (var j = 0; j < content.length; j++){
                      switch(content[j].getMetadata().getName()){
                        case 'sap.m.TextArea':
                          if( content[j].getValue() !== ""){
                            items[i].setHeaderText(content[j].getValue());
                          }
                          break;
                        case 'sap.m.List':
                          if (content[j].getSelectedItem() && content[j].getSelectedItem().getTitle() !== ""){
                            items[i].setHeaderText(content[j].getSelectedItem().getTitle());
                          }
                          break; 
                        case 'sap.ui.unified.Calendar':
                          var oSelectedDates = content[j].getSelectedDates()[0];
                          var oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "dd.MM.yyyy", calendarType: 'Gregorian'});
                          if (oSelectedDates) {
                            var oDate = oSelectedDates.getStartDate();
                            if (oDate) {
                              var text = oFormatYyyymmdd.format(oDate);
                            } 
                            oDate = oSelectedDates.getEndDate();
                            if (oDate) {
                              text = text + ' - ' + oFormatYyyymmdd.format(oDate);
                            }
                            items[i].setHeaderText(text);
                          }
                          break;
                      }
                    }
                  //}
                }
              }
            }
          }
        },
        getContentList: function(source){
          var contentList = [];
          if (typeof source.getContent === 'function'){
            var content = source.getContent();
            for (var i = 0; i < content.length; i++){
              contentList.push(content[i]);
              var nextCont = this.getContentList(content[i]);
              for (var j = 0; j < nextCont.length; j++){
                contentList.push(nextCont[j]);
              }
            }
          }
          return contentList;
        }


      }
    );
  }
);
