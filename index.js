const { request } = require("express");
const express = require("express");
const cors = require("cors");
const app = express();
const connection = require("./config");

const { SERVER_PORT, CLIENT_URL } = process.env;

app.use(
  cors({
    origin: CLIENT_URL,
  })
);
app.use(express.json());

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

app.get("/users", (req, res) => {
  connection.query(
    "SELECT * FROM user WHERE nickname = ?",
    [req.query.nickname],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.length === 0) {
        res.status(404).send("Aucun utilisateur ne s'est enregistré à ce nom");
      } else {
        res.status(200).json(result);
      }
    }
  );
});

// En tant qu'utilisateur, je peux consulter tous les livres que j'ai enregistré d'un auteur particulier
app.get("/users/:user_id/books/authors/:author_id", (req, res) => {
  connection.query(
    "SELECT * FROM comic_book WHERE user_id = ? AND author_id = ?",
    [req.params.user_id, req.params.author_id],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.length === 0) {
        res
          .status(404)
          .send("Vous n'avez pas encore enregistré de BD de cet.te auteur.e");
      } else {
        res.status(200).json(result);
      }
    }
  );
});

// En tant qu'utilisateur, je peux consulter tous les livres que j'ai enregistré
app.get("/users/:id/books", (req, res) => {
  connection.query(
    "SELECT * FROM comic_book WHERE user_id = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.length === 0) {
        res.status(404).send("Vous n'avez pas encore enregistré de BD");
      } else {
        res.status(200).json(result);
      }
    }
  );
});

// En tant qu'utilisateur, je peux ajouter un livre
app.post("/users/:id/books", (req, res) => {
  const {
    title,
    published_date,
    cover_src,
    page_count,
    author_id,
    user_id,
  } = req.body;
  connection.query(
    "INSERT into comic_book(title, published_date, cover_src, page_count,author_id, user_id) VALUES(?, ?, ?, ?, ?, ?)",
    [title, published_date, cover_src, page_count,author_id, user_id],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.affectedRows < 1) {
        res.sendStatus(400);
      } else {
        res.status(201).json({
          id: result.insertId,
          ...req.body,
        });
      }
    }
  );
});

// En tant qu'utilisateur, je peux consulter tous les livres favoris que j'ai enregistré
app.get("/users/:id/books/favorites", (req, res) => {
  connection.query(
    "SELECT * FROM comic_book WHERE user_id = ? AND favorite = 1",
    [req.params.id],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.length === 0) {
        res.status(404).send("Vous n'avez pas encore de BD favorites");
      } else {
        res.status(200).json(result);
      }
    }
  );
});

// En tant qu'utilisateur, je peux modifier la couverture d'un album
app.put("/users/:user_id/books/:book_id/cover", (req, res) => {
  const { cover_src } = req.body;
  connection.query(
    "UPDATE comic_book SET cover_src = ? WHERE user_id = ? AND id = ?",
    [cover_src, req.params.user_id, req.params.book_id],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        console.log(req.body);
        res.sendStatus(200);
      }
    }
  );
});

// En tant qu'utilisateur, je peux supprimer un album de ma collection
app.delete("/users/:user_id/books/:book_id", (req, res) => {
  connection.query(
    "DELETE FROM comic_book WHERE user_id = ? AND id = ?",
    [req.params.user_id, req.params.book_id],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

// En tant qu'utilisateur, je peux ajouter ou supprimer un album de mes favoris
app.put("/users/:user_id/books/:book_id", (req, res) => {
  connection.query(
    "UPDATE comic_book SET favorite = !favorite WHERE user_id = ? AND id = ?",
    [req.params.user_id, req.params.book_id],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.sendStatus(200);
      }
    }
  );
});

// En tant qu'utilisateur, je peux consulter le détail d'un album
app.get("/books/:id", (req, res) => {
  connection.query(
    "SELECT * FROM comic_book WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.length === 0) {
        res.status(404).send("L'album demandé n'existe pas");
      } else {
        res.status(200).json(result);
      }
    }
  );
});

app.listen(SERVER_PORT, () => {
  console.log(`server is running on port ${SERVER_PORT}`);
});
