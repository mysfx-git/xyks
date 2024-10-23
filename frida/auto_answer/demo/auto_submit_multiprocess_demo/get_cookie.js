Java.perform(function () {
    console.log("Java.perform started");

    try {
        // 动态查找已加载的类
        Java.enumerateLoadedClasses({
            onMatch: function (className) {
                console.log("Loaded class: " + className);
                if (className.startsWith('okhttp3.')) {
                    console.log("Found OkHttp class: " + className);
                }
            },
            onComplete: function () {
                console.log("Class enumeration complete");
            }
        });

        // 尝试加载 Request.Builder 类
        var RequestBuilder = Java.use('okhttp3.Request$Builder');
        var Request = Java.use('okhttp3.Request');

        // 拦截 Request.Builder 的 build 方法
        RequestBuilder.build.implementation = function () {
            console.log("Intercepted Request.Builder.build");

            // 调用原始方法
            var request = this.build();

            // 检查请求方法是否为 GET
            if (request.method().toUpperCase() === 'GET') {
                console.log("Intercepted GET request");

                // 获取请求的 URL
                var url = request.url().toString();
                console.log("Request URL: " + url);

                // 定义 URL 过滤条件，例如只抓取包含特定域名的 URL
                if (url.includes("example.com")) { // 将 "example.com" 替换为你的目标域名或条件
                    console.log("Filtered URL: " + url);

                    // 获取请求头
                    var headers = request.headers();
                    console.log("Request Headers:");
                    for (var i = 0; i < headers.size(); i++) {
                        var name = headers.name(i);
                        var value = headers.value(i);
                        console.log(name + ": " + value);

                        // 检查 Cookie
                        if (name.toLowerCase() === 'cookie') {
                            console.log("Cookie: " + value);
                            // 将 URL 和 Cookie 一起发送回 Python 脚本
                            send({ url: url, cookie: value });
                        }
                    }
                } else {
                    console.log("URL does not match filter conditions, ignoring.");
                }
            }

            return request;
        };

        console.log("Started intercepting Request.Builder.build for GET requests with URL filtering");
    } catch (err) {
        console.log("Request.Builder not found: " + err);
    }
});
