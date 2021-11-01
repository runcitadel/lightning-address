import Koa from "koa";
import Router from "@koa/router";
import * as child_process from "child_process";

const app = new Koa();
const router = new Router();

// child_process.exec
const usernames: Record<string, string> = {
    "test123": "st5owtpsa2e62yf64luxogbecj7lk3t5vmesshsnrzu2untyf2i4t4ad.onion"
}
router.get("/.well-known/lnurlp/:username", async (ctx, next) => {
    const username: string = ctx.params.username;
    if (usernames[username.toLowerCase()]) {
        // Use curl -s --socks5-hostname 127.0.0.1:9050 http://${usernames[username.toLowerCase()]}/.well-known/lnurlp/${username}
        const url = `http://${usernames[username.toLowerCase()]}/.well-known/lnurlp/${username}`;
        // Run curl in a subprocess
        const child = child_process.execSync(`curl -s --socks5-hostname 127.0.0.1:9050 ${url}`);
        ctx.body = JSON.parse(child.toString());
    } else {
        ctx.status = 404;
    }
    await next();
});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);
