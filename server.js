const Koa = require("koa");
const Router = require("koa-router");
const koaBody = require("koa-body");
const { v4: uuidv4 } = require("uuid");
const cors = require("@koa/cors");

const app = new Koa();
const router = new Router();
const tickets = [];

// Middleware для разрешения CORS
app.use(cors());

// Middleware для обработки тела запроса
app.use(koaBody());

// GET ?method=allTickets - возвращает список тикетов без description
router.get("/", (ctx) => {
  const { method, id } = ctx.request.query;

  if (method === "allTickets") {
    ctx.response.body = tickets.map(({ id, name, status, created }) => ({
      id,
      name,
      status,
      created,
    }));
  } else if (method === "ticketById" && id) {
    const ticket = tickets.find((ticket) => ticket.id === id);
    if (ticket) {
      ctx.response.body = ticket;
    } else {
      ctx.response.status = 404;
      ctx.response.body = { error: "Ticket not found" };
    }
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Invalid method" };
  }
});

// POST ?method=createTicket - создает новый тикет
router.post("/", (ctx) => {
  const { method } = ctx.request.query;

  if (method === "createTicket") {
    const { name, description, status } = ctx.request.body;
    const newTicket = {
      id: uuidv4(),
      name,
      description,
      status: status || false,
      created: Date.now(),
    };
    tickets.push(newTicket);
    ctx.response.status = 201;
    ctx.response.body = newTicket;
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Invalid method" };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 7070;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
