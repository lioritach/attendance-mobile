sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
  ],
  function (Controller, JSONModel, Fragment) {
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
        }
      }
    );
  }
);
