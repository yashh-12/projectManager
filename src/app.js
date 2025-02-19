import connectDb from "../db/index.js";
import isLoggedIn from "../middelware/loggedIn.js";
import refreshAccessToken from "../middelware/refreshAceesToken.js";
import expressServer from "../utils/expressServer.js";

const app = expressServer();


//import routes
import userRouter from "../routes/user.routes.js";


// routes
app.use("/api/auth", userRouter);


//Home Route
app.get("/", refreshAccessToken, isLoggedIn, (req, res) => {
  res.render("index", { isLoggedIn: req.isLoggedIn, error: "error" });
});


//404 Route
app.use((req, res) => {
  res.status(404).render("error", { error: "Page not found" });
});


//Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});


//Connection Checking
const connection = await connectDb();
const port = process.env.PORT ?? 8000;
if (connection) {
  console.log(
    "Successfully connected to database : ",
    connection.connection.host
  );
  app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
}
