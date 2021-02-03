const { request } = require("express");
const express = require("express");
const cors = require('cors');
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
          res
            .status(404)
            .send("Aucun utilisateur ne s'est enregistré à ce nom");
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


/* En tant qu'utilisateur, je peux filtrer ma collection par genre, auteur, etc...
En tant qu'utilisateur, je peux ajouter ou supprimer un album de mes favoris
En tant qu'utilisateur, je peux supprimer un album de ma collection */
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
