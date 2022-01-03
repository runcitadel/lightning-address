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

const proxy = process.env.socks_proxy || "socks5h://127.0.0.1:9050";
const app = new Koa();
const router = new Router();
const agent = new SocksProxyAgent(proxy);

const usernames: Record<string, string> = {
  bitcoinduck21:
    "2vyghz33kgx2q3hket3roi3juitylgqxyox6x4hhepty5zvrieerokyd.onion",
  blackhole21: "2vyghz33kgx2q3hket3roi3juitylgqxyox6x4hhepty5zvrieerokyd.onion",
  satoshi: "st5owtpsa2e62yf64luxogbecj7lk3t5vmesshsnrzu2untyf2i4t4ad.onion",
  kwadde: "6dto7yiknvvvpmtel2ckwutf3cr6bt2ubmg2v5u7ssqsjojgcvoqrzyd.onion",
  corn: "mss2quvfmsid7xhp5a2cua4e5pd33g4frznstdbg7sf7nk6hzi7sglad.onion",
  "🌽": "mss2quvfmsid7xhp5a2cua4e5pd33g4frznstdbg7sf7nk6hzi7sglad.onion",
  paul: "lhq3fclx5aqkrqa42bu7r2my5pvep3ggthvjtfqm3ztmksga5jlu23yd.onion",
  leon: "uat2fettt2qzjczyqpxthnkohisynenzblahnszyna3dqw2vsih6hkid.onion",
  leonmw : "uat2fettt2qzjczyqpxthnkohisynenzblahnszyna3dqw2vsih6hkid.onion",
  erik: "lalqnv4xqk4xu64gsmwfpwu6ugddog4y4agqk5tzux2dwwju4m5dy3yd.onion",
  swedishfrenchpress: "lalqnv4xqk4xu64gsmwfpwu6ugddog4y4agqk5tzux2dwwju4m5dy3yd.onion",
  tips: "3v6rjasrhx2x3ssemdir3ydzj5ui76txppaj6thzdy7h74yzvapuotyd.onion",
  vasilo: "pknfq5qysdw7qpwbximhwbubz7ft5dtyn5kpoxp3s76bzkkywlsbsqad.onion",
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
            "X-Forwarded-For": "ln.runcitadel.space",
          },
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
const server = https.createServer(config.https.options, app.callback());
server.listen(443, function() {
  console.log("Listening");
});

