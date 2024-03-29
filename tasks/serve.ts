import Log from "@util/Log";
import ansi from "ansicolor";
import connect, { ErrorHandleFunction, NextHandleFunction } from "connect";
import encodeUrl from "encodeurl";
import escapeHTML from "escape-html";
import fs from "fs-extra";
import http from "http";
import os from "os";
import parseUrl from "parseurl";
import path from "path";
import serveStatic from "serve-static";
import url from "url";
import Task from "./utilities/Task";

export default Task("serve", () => {
	const app = connect();
	const root = "docs";

	app.use((req, res, next) => {
		Log.info(ansi.darkGray(`${req.method!}`), ansi.cyan(`${req.url!}`), req.headers["user-agent"]);
		next();
	});

	app.use(serveStaticFixer(root));
	app.use(serveStatic(root, { fallthrough: false, extensions: ["html"] }));

	app.use(((err: Error & { status: number }, req, res, next) => {
		Log.error(ansi.darkGray(`${req.method!}`), ansi.cyan(`${req.url!}`), ansi.red(err.status.toString()), ansi.red(err.message));
		res.write(`Cannot ${req.method!} ${req.url!}`);
		res.end();
	}) as ErrorHandleFunction);

	const server = http.createServer(app);

	const port = process.env.PORT ? +process.env.PORT : 4000;
	return new Promise<void>(resolve => {
		server.listen(port, "0.0.0.0", function () {
			const networkInterfaces = os.networkInterfaces();
			Log.info("Serving", ansi.cyan(root), "on:", ...Object.values(networkInterfaces)
				.flatMap(interfaces => interfaces)
				.filter((details): details is os.NetworkInterfaceInfoIPv4 => details?.family === "IPv4")
				.map(details => ansi.darkGray(`http://${details.address}:${port}`)));

			resolve();
		});
	});
});

////////////////////////////////////
// I hate all of this
//

function serveStaticFixer (root: string): NextHandleFunction {

	return async function (req, res, next) {

		const originalUrl = parseUrl.original(req)!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		let file = parseUrl(req)?.pathname!;

		// make sure redirect occurs at mount
		if (file === "/" && originalUrl?.pathname?.substr(-1) !== "/")
			file = "";

		if (file?.endsWith("/")) {
			file = file.slice(0, -1);

			if (await hasHTMLFile(path.resolve(path.join(root, file)))) {
				originalUrl.path = null;
				console.log(originalUrl.pathname, collapseLeadingSlashes(`${originalUrl.pathname!.replace(/\/$/, "")}`));
				originalUrl.pathname = collapseLeadingSlashes(`${originalUrl.pathname!.replace(/\/$/, "")}`);

				// reformat the URL
				const loc = encodeUrl(url.format(originalUrl));
				const doc = createHtmlDocument("Redirecting", 'Redirecting to <a href="' + escapeHTML(loc) + '">' +
					escapeHTML(loc) + "</a>")

				// send redirect response
				res.statusCode = 301
				res.setHeader("Content-Type", "text/html; charset=UTF-8");
				res.setHeader("Content-Length", Buffer.byteLength(doc));
				res.setHeader("Content-Security-Policy", "default-src 'none'");
				res.setHeader("X-Content-Type-Options", "nosniff");
				res.setHeader("Location", loc);
				res.end(doc);
				return;
			}

			next();
			return;
		}

		if (await hasHTMLFile(path.resolve(path.join(root, file)))) {
			if (req.url)
				req.url += ".html";
			if (req.originalUrl)
				req.originalUrl += ".html";

		}

		next();
	}
}

async function hasHTMLFile (file: string) {
	let stat = await fs.stat(file).catch(err => undefined);
	if (stat?.isDirectory()) {
		const htmlVersion = `${file}.html`;
		stat = await fs.stat(htmlVersion).catch(err => undefined);
		return !!stat;
	}
}

function collapseLeadingSlashes (str: string) {
	let i = 0;
	for (; i < str.length; i++)
		if (str.charCodeAt(i) !== 0x2f /* / */)
			break;

	return i > 1 ? "/" + str.substr(i) : str;
}

function createHtmlDocument (title: string, body: string) {
	return "<!DOCTYPE html>\n" +
		'<html lang="en">\n' +
		"<head>\n" +
		'<meta charset="utf-8">\n' +
		"<title>" + title + "</title>\n" +
		"</head>\n" +
		"<body>\n" +
		"<pre>" + body + "</pre>\n" +
		"</body>\n" +
		"</html>\n"
}
