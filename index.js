const express = require("express");
const { createServer } = require("http");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);

const corsOrigin = "http://localhost:3000";
const io = new Server(httpServer, {
	cors: {
		origin: corsOrigin,
		credentials: true,
	},
});
app.get("/", (req, res) => {
	// res.sendFile(__dirname + "/index.html");
	res.json({ message: "Ok" });
});

io.on("connection", (socket) => {
	console.log("a user connected");
	socket.on("datatest", ({ test, orderId }) => {
		socket.emit("afterCheck", {
			message: "thanh toan thanh cong",
			orderId: orderId,
		});
	});
});
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
	console.log("listening on *:4000");
});
