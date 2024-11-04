const fs = require("fs");
const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body").default || require("koa-body");
const koaStatic = require("koa-static");
const path = require("path");
const uuid = require("uuid");

const app = new Koa();
const tickets = [];

app.use(koaStatic(path.join(__dirname, "/public")));
app.use(koaBody());

// CORS middleware
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  await next();
});

// Добавлен обработчик для корневого маршрута
app.use(async (ctx) => {
  if (ctx.request.path === "/") {
    // Если запрос к корневому маршруту
    ctx.response.body =
      "Server is running. Use /?method=allTickets to get tickets.";
    return;
  }

  const { method } = ctx.request.query;

  switch (method) {
    case "allTickets":
      ctx.response.body = tickets;
      return;
    case "createTicket":
      const { name, description, status } = ctx.request.body;
      const newTicket = {
        id: uuid.v4(),
        name,
        description,
        status: status === "true",
        created: Date.now(),
      };
      tickets.push(newTicket);
      ctx.response.body = newTicket;
      return;
    default:
      ctx.response.status = 404;
      return;
  }
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
