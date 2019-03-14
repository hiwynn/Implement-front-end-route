function Router() {
	this.routes = {};
	this.currentUrl = '';
}

//route 存储路由更新时的回调到回调数组routes中，回调函数将负责对页面的更新
Router.prototype.route = function (path, callback) {
	this.routes[path] = callback || function () {
	};//给不同的hash设置不同的回调函数
};
//refresh 执行当前url对应的回调函数，更新页面
Router.prototype.refresh = function () {
	console.log(location.hash.slice(1));//获取到相应的hash值
	this.currentUrl = location.hash.slice(1) || '/';//如果存在hash值则获取到，否则设置hash值为/
	console.log(this.currentUrl);
	this.routes[this.currentUrl]();//根据当前的hash值来调用相对应的回调函数
};
//init 监听浏览器url hash更新事件
Router.prototype.init = function () {
	console.log(this);
	window.addEventListener('load', this.refresh.bind(this), false);
	window.addEventListener('hashchange', this.refresh.bind(this), false);
}


(function (window) {
	if ("onhashchange" in window.document.body) {  // 如果浏览器不支持原生实现的事件，则开始模拟，否则退出。
		return;
	}
	var location = window.location,
		oldURL = location.href,
		oldHash = location.hash;
	setInterval(function () {  // 每隔100ms检查hash是否发生变化
		var newURL = location.href,
			newHash = location.hash;
		// hash发生变化且全局注册有 onhashchange 方法（这个名字是为了和模拟的事件名保持统一）；
		if (newHash !== oldHash && typeof window.onhashchange === "function") {
			window.onhashchange({  // 执行方法
				type: "hashchange",
				oldURL: oldURL,
				newURL: newURL
			});
			oldURL = newURL;
			oldHash = newHash;
		}
	}, 100);
})(window);