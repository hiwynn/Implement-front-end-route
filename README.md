# Implement-front-end-route

让我们先对路由有个了解
#### 1. 后端路由
当我们访问一个地址时，浏览器会向后台服务器发出一个请求，服务器响应请求，后台拼接 HTML 文件传给前端显示。
```
Route::get('/home', 'HomeController@index')->name('home');
```

#### 2. 前端路由
单页面应用（SPA）的原理：JS 能感知到当前 URL 的变化，从而动态的将当前页面的内容清除并展示新的内容。
```
{
    name    : 'login',
    url     : '/login',
    parent  : '',
    abstract: false,
    views   : [{
        name        : 'main',
        templateUrl : 'views/login.html',
        controller  : 'loginController',
        controllerAs: 'ctrl',
        paths       : ['controllers/loginController', 'services/AuthData']
    }]
}
```
> 随着前后端的分离和单页面应用的普及，目前很多项目都在使用前端路由。

### 实现前端路由目前主要有 2 种方法
1. 利用 URL 的 hash，就是 URL 中“#”后面的内容，类似点击页面中的某个图标返回页面顶部和底部。JS 通过 hashChange 的事件来监听 URL 的变化。一般常用框架的路由机制都采用这种方法，例如AngularJS 的 ngRoute 和 二次开发模块 ui-router，react 的 react-route,vue-route 等。
   > hash 的改变不会导致页面重新加载，它的变化会直接反映到浏览器地址栏，浏览器 URL 中 hash 的变化影响 window.location.hash 的值的变化从而触发 onhashchange 事件。
2. 利用 HTML5 的 History 模式，使 URL 看起来类似普通网站，以 / 分割，没有 #，但页面没有跳转。

## 1. 利用 hash
当页面的 URL 发生变化时，触发 hashchange 注册的回调，回调中去进行不同的操作。
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>前端路由实现</title>
    <script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
    <script src="./router.js"></script>
    <style>
        .warp {
            width: 400px;
            height: 400px;
            border: 1px solid grey;
            margin: 0 auto;
        }

        .nav {
            border-bottom: 1px solid grey;
        }

        .nav li {
            display: inline-block;
            list-style: none;
        }

        .nav li a {
            display: inline-block;
            text-decoration: none;
            padding: 10px 15px;
        }

        .router {
            padding: 20px;
        }

        a {
            cursor: pointer;
        }
    </style>
</head>
<body>
<section class="warp">
    <ul>
        <li><a href="#/shouye">首页</a></li>
        <li><a href="#/home">主页</a></li>
        <li><a href="#/about">详情页</a></li>
    </ul>

</section>

<script type="text/javascript">
	var content = document.querySelector('body');
	//给window对象挂载属性
	window.Router = new Router();
	window.Router.init();
	Router.route('/shouye', function () {
		alert("这是shou页");
	});
	Router.route('/home', function () {
		alert("这是主页");
	});
	Router.route('/about', function () {
		alert("这是详情页");
	});
</script>
</body>
</html>
```

router.js

```
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
```
> element.addEventListener(event, function, useCapture)，第一个参数是事件的类型 (如 "click" 或 "mousedown")，第二个参数是事件触发后调用的函数，第三个参数是个布尔值用于描述事件是冒泡还是捕获。该参数是可选的。

低版本的IE浏览器不支持 hashchange 事件，需要通过轮询监听 URL 的变化来实现。
```
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
```

## 2. 利用 History API
HTML5 新增了 History API，History 对象保存着用户的上网记录。
* history.length 保存着历史记录的 URL 的数量。初始时，该值为1。当前窗口先后访问了几个网址，这个值就是几。
* 跳转方法：go()、back()和forward()
* history.pushState() 和 history.replaceState()，这两个 API 都接收三个参数(pushState 会增加一条新的历史纪录，replaceState 会替换当前历史纪录)：
   * 状态对象（state object）， 一个JavaScript对象，与用pushState()方法创建的新历史记录条目关联。无论何时用户导航到新创建的状态，popstate事件都会被触发，并且事件对象的state属性都包含历史记录条目的状态对象的拷贝。
   * 标题（title），FireFox浏览器目前会忽略该参数，虽然以后可能会用上。考虑到未来可能会对该方法进行修改，传一个空字符串会比较安全。或者，你也可以传入一个简短的标题，标明将要进入的状态。
   * 地址（URL），新的历史记录条目的地址。浏览器不会在调用pushState()方法后加载该地址，但之后，可能会试图加载，例如用户重启浏览器。新的URL不一定是绝对路径；如果是相对路径，它将以当前URL为基准；传入的URL与当前URL应该是同源的，否则，pushState()会抛出异常。该参数是可选的；不指定的话则为文档当前URL。

```angular2html
<body>
<p>You are at coordinate <span id="coord">5</span> on the line.</p>
<p>
    <a href="?x=6" onclick="go(1); return false;">Advance to 6</a> or
    <a href="?x=4" onclick="go(-1); return false;">retreat to 4</a>?
</p>
<script>
	var currentPage = 5; // prefilled by server
	function go(d) {
		setupPage(currentPage + d);
		history.pushState(currentPage, document.title, '?x=' + currentPage);
	}

	function setupPage(page) {
		currentPage = page;
		document.title = 'Line Game - ' + currentPage;
		document.getElementById('coord').textContent = currentPage;
		document.links[0].href = '?x=' + (currentPage + 1);
		document.links[0].textContent = 'Advance to ' + (currentPage + 1);
		document.links[1].href = '?x=' + (currentPage - 1);
		document.links[1].textContent = 'retreat to ' + (currentPage - 1);
	}
</script>
</body>
```

***

参考：
* https://blog.csdn.net/sh435367384/article/details/79777662
* https://blog.csdn.net/qq_22244233/article/details/79614114
* http://www.cnblogs.com/carriezhao/p/6861319.html


