const express = require("express");
const { createServer } = require("http");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);

const corsOrigin = process.env.BASE_CORSORIGIN || "http://localhost:3000";
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

let orderData = [];
let adminSocketId = "";
function statusPaidForClient(orderSocketId) {
	if (orderSocketId) {
		console.log(1);
		io
			.to(orderSocketId.socketId)
			.emit("apply approved", { message: "your order is approved" });
		io
			.to(adminSocketId)
			.emit("comfirm success", { message: "your comfirm is success" });
	} else {
		io
			.to(adminSocketId)
			.emit("comfirm fail", { message: "your comfirm is fail" });
	}
}
function statusShippingForClient(orderSocketId) {
	if (orderSocketId) {
		io
			.to(orderSocketId.socketId)
			.emit("order shipping", { message: "your order is shipping" });
		io.to(adminSocketId).emit("order shipping success", {
			message: "your action shipping is success",
		});
	} else {
		io
			.to(adminSocketId)
			.emit("order shipping fail", { message: "your action shipping is fail" });
	}
}
function statusDeliveredForClient(orderSocketId) {
	if (orderSocketId) {
		io
			.to(orderSocketId.socketId)
			.emit("order delivered", { message: "your order is delivered" });
		io.to(adminSocketId).emit("order delivered success", {
			message: "your action delivered is success",
		});
	} else {
		io
			.to(adminSocketId)
			.emit("order delivered fail", { message: "your action delivered is fail" });
	}
}
function statusCompletedForClient(orderSocketId) {
	if (orderSocketId) {
		io
			.to(orderSocketId.socketId)
			.emit("order completed", { message: "your order is completed" });
		io.to(adminSocketId).emit("order completed success", {
			message: "your action completed is success",
		});
	} else {
		io
			.to(adminSocketId)
			.emit("order completed fail", { message: "your action completed is fail" });
	}
}
io.on("connection", (socket) => {
	//customer

	socket.on("disconnect", () => {
		console.log("disconect:", socket.id); // false
		orderData = orderData.filter((order) => order.socketId !== socket.id);
	});

	socket.on("checkout", ({ message, orderId }) => {
		console.log(message, orderId);
		if (orderData.length === 0) {
			orderData.push({ orderId: orderId, socketId: socket.id });
		} else {
			const findOrder = orderData.find((order) => order.orderId === orderId);
			// console.log(findOrder);
			if (findOrder) {
				console.log("sameOrderId");
			} else {
				orderData.push({ orderId: orderId, socketId: socket.id });
			}
		}
		if (adminSocketId) {
			io.to(adminSocketId).emit("new order", { message: "you have a new order" });
		}
		console.log(orderData);
	});

	//admin
	socket.on("admin login", ({ message }) => {
		console.log("admin id:", socket.id);
		adminSocketId = socket.id;
	});

	socket.on("apply order", ({ statusOrder, orderId }) => {
		adminSocketId = socket.id;
		let orderSocketId = orderData.find((order) => order.orderId === orderId);
		console.log("comfirm order:", orderId);
		switch (statusOrder) {
			case "paid":
				statusPaidForClient(orderSocketId);
				break;
			case "shipping":
				statusShippingForClient(orderSocketId);
				break;
			case "delivered":
				statusDeliveredForClient(orderSocketId);
				break;
			case "completed":
				statusCompletedForClient(orderSocketId);
				break;
		}
	});
	socket.on("reject order", ({ statusOrder, orderId }) => {
		adminSocketId = socket.id;
		let orderSocketId = orderData.find((order) => order.orderId === orderId);
		if (orderSocketId) {
			io
				.to(orderSocketId.socketId)
				.emit("apply rejected", { message: "your order is rejected" });
			io
				.to(adminSocketId)
				.emit("rejecte success", { message: "your action reject is success" });
		} else {
			io
				.to(adminSocketId)
				.emit("rejecte fail", { message: "your reject is fail" });
		}
	});
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
	console.log(`listening on *:${PORT}`);
});
