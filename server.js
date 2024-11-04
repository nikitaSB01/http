const fs = require("fs");
const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-bodyparser");
const koaStatic = require("koa-static");
const path = require("path");
const uuid = require("uuid");
const cors = require("@koa/cors");

const app = new Koa();
const tickets = [];

// Указываем путь к статическим файлам (index.html, css, js)
app.use(koaStatic(path.join(__dirname, "../http_cli"))); // Путь к http_cli

// Middleware для парсинга тела запроса
app.use(koaBody());

// Middleware для CORS
app.use(cors());

// Обработчик для корневого маршрута
app.use(async (ctx) => {
  const { method } = ctx.request.query;

  if (ctx.request.path === "/") {
    ctx.response.body =
      "Server is running. Use /?method=allTickets to get tickets.";
    return;
  }

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
    case "ticketById":
      const ticketId = ctx.request.query.id;
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        ctx.response.body = ticket;
      } else {
        ctx.response.status = 404;
        ctx.response.body = { message: "Ticket not found" };
      }
      return;
    default:
      ctx.response.status = 400; // Изменяем статус на 400 для некорректных запросов
      ctx.response.body = { message: "Bad Request" };
      return;
  }
});

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
