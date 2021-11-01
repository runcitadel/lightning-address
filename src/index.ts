import Koa from "koa";
import Router from "@koa/router";
import fetch from "node-fetch";
import SocksProxyAgentPkg from "socks-proxy-agent";
const SocksProxyAgent = SocksProxyAgentPkg.SocksProxyAgent;

// Connect to the local tor daemon

const proxy = process.env.socks_proxy || 'socks5h://127.0.0.1:9050';
const app = new Koa();
const router = new Router();
const agent = new SocksProxyAgent(proxy);

const usernames: Record<string, string> = {
    "test123": "t5owtpsa2e62yf64luxogbecj7lk3t5vmesshsnrzu2untyf2i4t4ad.onion"
}
router.get("/.well-known/lnurlp/:username", async (ctx) => {
    const username: string = ctx.params.username;
    if (usernames[username.toLowerCase()]) {
        // send a request to the users onion
        const apiResponse = await fetch(`${usernames[username.toLowerCase()]}/.well-known/lnurlp/${username}`, {
            agent
        });
        const json = await apiResponse.json();
        ctx.body = json;
    } else {
        ctx.status = 404;
    }
});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
