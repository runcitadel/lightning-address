import Koa from "koa";
import Router from "@koa/router";
import fetch from "node-fetch";
import SocksProxyAgentPkg from "socks-proxy-agent";
const SocksProxyAgent = SocksProxyAgentPkg.SocksProxyAgent;
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

const config = {
  domain: "ln.runcitadel.space",
  https: {
    port: 443,
    options: {
      key: fs
        .readFileSync(
          "/etc/letsencrypt/live/ln.runcitadel.space/privkey.pem",
          "utf8"
        )
        .toString(),

      cert: fs
        .readFileSync(
          "/etc/letsencrypt/live/ln.runcitadel.space/fullchain.pem",
          "utf8"
        )
        .toString(),
    },
  },
};

// Connect to the local tor daemon

const proxy = process.env.socks_proxy || "socks5h://localhost:9050";
const app = new Koa();
const router = new Router();
const agent = new SocksProxyAgent(proxy);

const usernames: Record<string, string> = {
  bitcoinduck21:
    "2vyghz33kgx2q3hket3roi3juitylgqxyox6x4hhepty5zvrieerokyd.onion",
  blackhole21: "2vyghz33kgx2q3hket3roi3juitylgqxyox6x4hhepty5zvrieerokyd.onion",
  satoshi: "st5owtpsa2e62yf64luxogbecj7lk3t5vmesshsnrzu2untyf2i4t4ad.onion",
  kwadde: "6dto7yiknvvvpmtel2ckwutf3cr6bt2ubmg2v5u7ssqsjojgcvoqrzyd.onion",
  corn: "mss2quvfmsid7xhp5a2cua4e5pd33g4frznstdbg7sf7nk6hzi7sglad.onion/",
  "🌽": "mss2quvfmsid7xhp5a2cua4e5pd33g4frznstdbg7sf7nk6hzi7sglad.onion/",
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
          headers: {
            "X-Forwarded-By": "ln.runcitadel.space",
          },
        }
      );
      ctx.body = await apiResponse.json();
    } else {
      // send a request to the users onion
      const apiResponse = await fetch(
        `http://${
          usernames[username.toLowerCase()]
        }/.well-known/lnurlp/${username}`,
        {
          agent,
          headers: {
            "X-Forwarded-By": "ln.runcitadel.space",
          },
        }
      );
      ctx.body = await apiResponse.json();
    }
  } else {
    ctx.status = 404;
  }
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
