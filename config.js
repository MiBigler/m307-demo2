import express from "express";
import { engine } from "express-handlebars";
import pg from "pg";
const { Pool } = pg;
import cookieParser from "cookie-parser";
import multer from "multer";
const upload = multer({ dest: "public/uploads/" });
import bcrypt from "bcrypt";
import sessions from "express-session";
import bbz307 from "bbz307";

export function createApp(dbconfig) {
  const app = express();

  const pool = new Pool(dbconfig);
  const login = new bbz307.Login("users", ["id", "passwort", "email"], pool);

  app.engine("handlebars", engine());
  app.set("view engine", "handlebars");
  app.set("views", "./views");

  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    sessions({
      secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
      saveUninitialized: true,
      cookie: { maxAge: 86400000, secure: false },
      resave: false,
    })
  );

  app.locals.pool = pool;
  app.get("/register", function (req, res) {
    res.render("register");
  });

  app.post("/register", function (req, res) {
    var passwort = bcrypt.hashSync(req.body.passwort, 10);
    pool.query(
      "INSERT INTO users (email, passwort) VALUES ($1, $2)",
      [req.body.email, passwort],
      (error, result) => {
        if (error) {
          console.log(error);
        }
        res.redirect("/register");
      }
    );
  });

  app.post("/register", upload.none(), async (req, res) => {
    const user = await login.registerUser(req);
    if (user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/register");
      return;
    }
  });

  //Login//
  app.get("/login", function (req, res) {
    res.render("login");
  });

  app.post("/login", function (req, res) {
    pool.query(
      "SELECT * FROM users WHERE email = $1",
      [req.body.email],
      (error, result) => {
        if (error) {
          console.log(error);
        }
        if (bcrypt.compareSync(req.body.passwort, result.rows[0].passwort)) {
          req.session.user_id = result.rows[0].id;
          res.redirect("/");
        } else {
          res.redirect("/login");
        }
      }
    );
  });

  //Posts//
  app.get("/post", function (req, res) {
    res.render("post");
  });

  app.post("/post", upload.single("bild"), async function (req, res) {
    await pool.query(
      "INSERT INTO posts (user_id, title, bild) VALUES ($1, $2, $3)",
      [req.body.user_id, req.body.title, req.file.bild]
    );
    res.redirect("/");
  });

  app.post("/login", upload.none(), async (req, res) => {
    const user = await login.loginUser(req);
    if (!user) {
      res.redirect("/login");
      return;
    } else {
      res.redirect("/intern");
      return;
    }
  });

  return app;
}

export { upload };
