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
  "bitcoinduck21": "2vyghz33kgx2q3hket3roi3juitylgqxyox6x4hhepty5zvrieerokyd.onion",
  "blackhole21": "2vyghz33kgx2q3hket3roi3juitylgqxyox6x4hhepty5zvrieerokyd.onion",
  "satoshi": "st5owtpsa2e62yf64luxogbecj7lk3t5vmesshsnrzu2untyf2i4t4ad.onion",
  "kwadde21": "6dto7yiknvvvpmtel2ckwutf3cr6bt2ubmg2v5u7ssqsjojgcvoqrzyd.onion"
};

router.get("/.well-known/lnurlp/:username", async (ctx, next) => {
  const username: string = ctx.params.username;
  // Other request query params (all as string)
  const query = ctx.querystring ? `?${ctx.querystring}` : "";

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
      ctx.body = await apiResponse.json();
    } else {
      ctx.body = {
        status: "OK",
        callback: `https://ln.runcitadel.space/.well-known/lnurlp/${username}`,
        tag: "payRequest",
        maxSendable: 100000000,
        minSendable: 1000,
        metadata: `[["text/identifier", "${username}@${usernames[username.toLowerCase()]}"], ["text/plain", "Sats for ${username}@${usernames[username.toLowerCase()]}"]]`,
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
