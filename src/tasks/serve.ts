import ansi from "ansicolor";
import connect, { ErrorHandleFunction } from "connect";
import http from "http";
import os from "os";
import serveStatic from "serve-static";
import Log from "./utilities/Log";
import Task from "./utilities/Task";

export default Task("serve", () => {
	const app = connect();
	const root = "build";

	app.use((req, res, next) => {
		Log.info(ansi.darkGray(`${req.method}`), ansi.cyan(`${req.url}`), req.headers["user-agent"]);
		next();
	});

	app.use(serveStatic(root, { fallthrough: false }));

	app.use(((err, req, res, next) => {
		Log.error(ansi.darkGray(`${req.method}`), ansi.cyan(`${req.url}`), ansi.red(err.status), ansi.red(err.message));
		res.write(`Cannot ${req.method} ${req.url}`);
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
