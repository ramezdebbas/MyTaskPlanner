(function () {
    "use strict";

    WinJS.UI.Pages.define("/pages/home/home.html", {
        ready: function (element, options) {

        	while (appbar.firstChild) {
        		appbar.removeChild(appbar.firstChild);
        	}

        	var listControl = itemList.winControl;
        	Data.getCategories().then(function (list) {
        		var dataSourceList = new WinJS.Binding.List(list);
        		listControl.itemDataSource = dataSourceList.dataSource;
        		listControl.oniteminvoked = this.categorySelected.bind(this);
        	}.bind(this));
        },
        categorySelected: function (eventInfo) {
        	return WinJS.Navigation.navigate('/pages/tasks/tasks.html', { category: eventInfo.target.querySelector('h2').textContent });
        }
    });
})();
