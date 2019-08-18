import "reflect-metadata";
import * as koa from "koa";
import * as router from "koa-router";
import "querystring";
import "https";

const koaRouter = new router();
const app = new koa();

var response = "(not defined yet)";

function Router(path) {
  return function(target, name) {
    Reflect.defineMetadata("path", { path, name }, target);
  };
}

function bind(router, controller) {
  const meta = Reflect.getMetadata("path", controller.prototype);
  console.log("meta:", meta);
  const instance = new controller();
  router.get(meta.path, ctx => {
    instance[meta.name](ctx);
  });
}
class Controller {
  @Router("/")
  main(ctx) {
    console.log("response:", response);
    ctx.body = `//https://vk.com/dev/Javascript_SDK
    <script src="http://vk.com/js/api/xd_connection.js?2";  type="text/javascript"></script>
    VK.init(function() {
      // API initialization succeeded
      // Your code here
    });
    ${response}
    test`;
  }
}
bind(koaRouter, Controller);
app.use(koaRouter.routes());

try {
  (async () => {
    await callVK("users.get", { user_id: 210700286 });
  })();
} catch (error) {
  console.error("callVK error: ", error);
}

async function callVK(method: string, params: object, postData = "") {
  const config = { apiver: "5.101" };
  let headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  };
  let reqURL = `https://api.vk.com/method/${method}?${querystring.stringify(
    params
  )}&v=${config.apiver}`;

  if (postData) {
    var encPostData = querystring.stringify(postData);
    headers["Content-Length"] = encPostData.length;
  }

  //https://stackoverflow.com/a/40539133/1421036
  var options = {
    method: postData ? "POST" : "GET",
    headers: headers
  };

  var req = https.request(reqURL, options, res => {
    console.log("statusCode:", res.statusCode);
    console.log("headers:", res.headers);

    res.on("data", d => {
      response = d;
    });
  });

  req.on("error", e => {
    console.error(e);
  });

  req.write(encPostData);
  req.end();
}

app.listen(8080);
