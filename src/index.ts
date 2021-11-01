import Koa from "koa";
import Router from "@koa/router";
import fetch from "node-fetch";
import SocksProxyAgentPkg from "socks-proxy-agent";
const SocksProxyAgent = SocksProxyAgentPkg.SocksProxyAgent;

// Connect to the local tor daemon

const proxy = process.env.socks_proxy || "socks5h://localhost:9050";
const app = new Koa();
const router = new Router();
const agent = new SocksProxyAgent(proxy);

const usernames: Record<string, string> = {
  test123: "2vyghz33kgx2q3hket3roi3juitylgqxyox6x4hhepty5zvrieerokyd.onion",
};

router.get("/.well-known/lnurlp/:username", async (ctx, next) => {
  const username: string = ctx.params.username;
  // Other request query params (all as string)
  const query = ctx.querystring ? `?${ctx.querystring}` : "";
  console.log(query);

  if (usernames[username.toLowerCase()]) {
    if (query) {
      // send a request to the users onion
      const apiResponse = await fetch(
        `http://${
          usernames[username.toLowerCase()]
        }/.well-known/lnurlp/${username}${query}`,
        {
          agent,
        }
      );
      const json = JSON.parse(
        (await apiResponse.text()).replace(
          usernames[username.toLowerCase()],
          "ln.runcitadel.space"
        )
      );
      ctx.body = json;
    } else {
      ctx.body = {
        status: "OK",
        callback: `https://ln.runcitadel.space/.well-known/lnurlp/${username}`,
        tag: "payRequest",
        maxSendable: 100000000,
        minSendable: 1000,
        metadata: `[["text/identifier", "${username}@ln.runcitadel.space"], ["text/plain", "Sats for ${username}@ln.runcitadel.space"]]`,
        commentAllowed: 0,
      };
    }
  } else {
    ctx.status = 404;
  }
  await next();
});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
