(function () {
	"use strict"


	function _getData(kind) {
		return new WinJS.Promise(function (complete, fail) {

			var applicationData = Windows.Storage.ApplicationData.current;
			var roamingFolder = applicationData.roamingFolder;

			roamingFolder.getFileAsync(kind + '.js').then(function (file){
				Windows.Storage.FileIO.readTextAsync(file).then(function (text) {
					var list = JSON.parse(text);
					complete(list);
				});
			}, function (error) { //si no tengo nada en roamingData cargo los defaults
				WinJS.xhr({ url: '/data/' + kind + '.js' }).then(function (data) {

					roamingFolder.createFileAsync(kind + '.js').then(function (kindFile) {
						Windows.Storage.FileIO.writeTextAsync(kindFile, data.responseText); //y los copio a roamingData
					});

					var list = JSON.parse(data.responseText);
					complete(list);
				}.bind(this), function (error) {
					//Necesito manejar el error acá
					fail(error);
				});
			});
		});
	}

	function _getTasks(category) {
		return new WinJS.Promise(function (complete, fail) {
			_getData('tasks').then(function (tasks) {
				if (category) {
					var tasksList = [];
					tasks.forEach(function (task) {
						if (task.category === category)
							tasksList.push(task);
					});
					complete(tasksList);
				} else
					complete(tasks);
			});
		});
	}

	function _getCategories() {
		return _getData('categories');
	}

	function _updateTask(category, task) {
		return new WinJS.Promise(function (complete, fail) {
			_getTasks().then(function (tasks) {
				tasks.forEach(function (t) {
					if (t.category === category && t.text === task) {
						t.done = !t.done;
					}
				});

				_saveTasks(tasks).then(function () {
					complete();
				});
				
			}.bind(this));
		});
	}

	function _saveTasks(tasks) {
		return new WinJS.Promise(function (complete, fail) {
			var serializedTasks = JSON.stringify(tasks);

			Windows.Storage.ApplicationData.current.roamingFolder.createFileAsync('tasks.js', Windows.Storage.CreationCollisionOption.replaceExisting).then(function (newFile) {
				Windows.Storage.FileIO.writeTextAsync(newFile, serializedTasks).then(function () {
					complete();
				});
			});
		});
	}

	function _insertTask(category, task) {
		return new WinJS.Promise(function (complete, fail) {
			_getTasks().then(function (tasks) {
				var exists = tasks.filter(function (t) {
					return t.category === category && t.text === task;
				});

				if (exists.length > 0)
					return fail(new WinJS.ErrorFromName('duplicate','Task "' + task + '" already exists in ' + category));

				tasks.push({ 'category': category, 'text': task, 'done': false });
				_saveTasks(tasks).then(function () {
					complete();
				});
			});
		});
	}

	function _removeTask(category, task) {
		return new WinJS.Promise(function (complete, fail) {
			_getTasks().then(function (tasks) {
				var index = 0;
				var found = false;
				tasks.forEach(function (t) {
					if (t.category === category && t.text === task)
						found = true;
					if (!found)
						index++;
				});

				var newList = tasks.splice(index, 1);

				_saveTasks(tasks).then(function () {
					complete();
				});
			});
		});
	}


	WinJS.Namespace.define("Data", {
		getCategories: _getCategories,
		getTasks: _getTasks,
		updateTask: _updateTask,
		insertTask: _insertTask,
		removeTask: _removeTask
	});

})();