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
  const posts = await app.locals.pool.query("SELECT * FROM posts");
  res.render("start", { posts: posts.rows });
});

/* Neue Posts erstellen */
app.get("/new_post", async function (req, res) {
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("new_post", {});
});

app.post("/create_post", upload.single("bild"), async function (req, res) {
  const imagePath = `/uploads/${req.file.filename}`; // Bildpfad
  await app.locals.pool.query(
    "INSERT INTO posts (title, bild, user_id) VALUES ($1, $2, $3)",
    [req.body.title, imagePath, req.session.user_id]
  );
  res.redirect("/");
});

/* Einzelne Posts anzeigen */
app.get("/post/:id", async function (req, res) {
  const post = await app.locals.pool.query(
    "SELECT * FROM posts WHERE id = $1",
    [req.params.id]
  );
  res.render("details", { post: post.rows[0] });
});

/* Impressum und Portfolio */
app.get("/impressum", async function (req, res) {
  res.render("impressum", {});
});

app.get("/portfolio", async function (req, res) {
  res.render("portfolio", {});
});

/* Server starten */
app.listen(3010, () => {
  console.log(`Example app listening at http://localhost:3010`);
});
