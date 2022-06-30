let path = require("path");
let express = require("express");
let mongoose = require("mongoose");
let cors = require("cors");
let bodyParser = require("body-parser");
const app = express();
const serviceRoutes = require("./routes/api/services");

require("dotenv").config();

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(
  cors({
      origin: "http://localhost:3000", 
      credentials: true,
  })
);
app.use("/public", express.static("public"));
app.use("/api", serviceRoutes);

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", error => console.log(error));
db.once("open", () => console.log("Database connected"));

app.listen(process.env.PORT, () => {
  console.log("Server is running...");
});

// app.use((req, res, next) => {
//   // Error goes via `next()` method
//   setImmediate(() => {
//     next(new Error("Something went wrong"));
//   });
// });
// app.use(function(err, req, res, next) {
//   console.error(err.message);
//   if (!err.statusCode) err.statusCode = 500;
//   res.status(err.statusCode).send(err.message);
// });
