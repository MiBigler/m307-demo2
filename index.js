import { createApp, upload } from "./config.js";

const app = createApp({
  user: "funky_town_8573",
  host: "bbz.cloud",
  database: "funky_town_8573",
  password: "abd621f061b3a48574638d63fbe6b9238",
  port: 30211,
});

/* Startseite */
app.get("/", async function (req, res) {
  const posts = await app.locals.pool.query("select * from posts");
  res.render("start", { posts: posts.rows });
});

app.get("/new_post", async function (req, res) {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("new_post", {});
});

app.get("/impressum", async function (req, res) {
  res.render("impressum", {});
});

/* app.get("/profile", async function (req, res) {
  const posts = await app.locals.pool.query(
    "SELECT * FROM posts WHERE user_id"
  );
  res.render("start", { posts: posts.rows });
}); */

app.get("/photo", async function (req, res) {
  const posts = await app.locals.pool.query("select * from posts");
  res.render("photo", { posts: posts.rows });
});
app.get("/profile", async function (req, res) {
  res.render("profile", {});
});

app.post("/create_post", upload.single("bild"), async function (req, res) {
  await app.locals.pool.query(
    "INSERT INTO posts (title, bild, user_id) VALUES ($1, $2, $3)",
    [req.body.title, req.file.filename, req.session.bild]
  );
  res.redirect("/");
});

/* post id */
app.get("/post/:id", async function (req, res) {
  const posts = await app.locals.pool.query(
    "SELECT * from posts WHERE id = $1",
    [req.params.id]
  );
  res.render("post", { posts: posts.rows });
});

/* Wichtig! Diese Zeilen müssen immer am Schluss der Website stehen! */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});
