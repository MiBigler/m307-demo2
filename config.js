import express from "express";
import { engine } from "express-handlebars";
import pg from "pg";
const { Pool } = pg;
import cookieParser from "cookie-parser";
import multer from "multer";
import bcrypt from "bcrypt";
import sessions from "express-session";
import bbz307 from "bbz307";

// Konfiguration für Multer (Dateiuploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Speicherort für hochgeladene Bilder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Eindeutiger Dateiname
  },
});
const upload = multer({ storage });

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

  app.post("/register", async (req, res) => {
    const passwort = bcrypt.hashSync(req.body.passwort, 10);
    await pool.query("INSERT INTO users (email, passwort) VALUES ($1, $2)", [
      req.body.email,
      passwort,
    ]);
    res.redirect("/login");
  });

  app.get("/login", function (req, res) {
    res.render("login");
  });

  app.post("/login", async (req, res) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      req.body.email,
    ]);
    if (
      result.rows.length > 0 &&
      bcrypt.compareSync(req.body.passwort, result.rows[0].passwort)
    ) {
      req.session.user_id = result.rows[0].id;
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  });

  return app;
}

export { upload };
