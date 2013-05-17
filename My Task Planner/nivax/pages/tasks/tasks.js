// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
	"use strict";

	WinJS.UI.Pages.define("/pages/tasks/tasks.html", {
		ready: function (element, options) {
			this.category = options.category;

			var title = WinJS.Utilities.query('.pagetitle')[0];
			title.textContent = options.category;
		
			Windows.Storage.ApplicationData.current.addEventListener("datachanged", this.dataChanged.bind(this));
			
			this.addCommands();
			inserTaskButton.addEventListener('click', this.insertTask.bind(this));
			this.loadData();
		},
		loadData: function () {
			var taskControl = taskList.winControl;
			Data.getTasks(this.category).then(function (tasks) {
				var bindingList = new WinJS.Binding.List(tasks);
				taskControl.itemDataSource = bindingList.dataSource;
				taskControl.oniteminvoked = this.doneChanged.bind(this);
			}.bind(this));
		},
		doneChanged: function (eventInfo){
			var task = WinJS.Utilities.query('h2', eventInfo.target)[0].textContent;
			Data.updateTask(this.category, task).then(function () {
				this.loadData();
			}.bind(this), function (error) {
				var e = error;
			});
		},
		addCommands: function () {

			while (appbar.firstChild) {
				appbar.removeChild(appbar.firstChild);
			}

			var appbarControl = appbar.winControl;

			var remove = document.createElement('button');
			remove.addEventListener('click', this.commandExecuted.bind(this),false);
			appbar.appendChild(remove);
			var options = { id: 'removeTask', icon: 'remove', label: 'Remove' };
			new WinJS.UI.AppBarCommand(remove, options);

			var insert = document.createElement('button');
			insert.addEventListener('click', this.commandExecuted.bind(this), false);
			appbar.appendChild(insert);
			options = { id: 'insertTask', icon: 'add', label: 'Insert' };
			new WinJS.UI.AppBarCommand(insert, options);
		},
		commandExecuted: function (eventInfo) {
			if (eventInfo.target.id === 'insertTask') {
				var flyoutObj = flyoutInsert.winControl;
				flyoutObj.show(eventInfo.target, 'top', 'left');
			}
			else if (eventInfo.target.id === 'removeTask') {
				var task = document.querySelector('.win-selected h2').textContent;
				Data.removeTask(this.category, task).then(function () {
					this.loadData();
				}.bind(this));
			};
		},
		insertTask: function (eventInfo) {
			var flyoutObj = flyoutInsert.winControl;
			flyoutObj.hide();
			Data.insertTask(this.category, taskName.value).then(function () {
				this.loadData();
			}.bind(this), function (error) {
				Windows.UI.Popups.MessageDialog(error.message, "Error").showAsync();
			});
		},
		dataChanged: function (){
			this.loadData();
		},
		unload: function () {
			// TODO: Respond to navigations away from this page.
		},

		updateLayout: function (element, viewState, lastViewState) {
			/// <param name="element" domElement="true" />

			// TODO: Respond to changes in viewState.
		}
	});
})();
