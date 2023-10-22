const express = require("express");
const expressApp = express();
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const upload = multer();
const serverPort = 3000;;
const dbPath = "public/database/users.db";
const db = new sqlite3.Database(dbPath);

const httpServer = require("http").createServer(expressApp);
const io = require("socket.io")(httpServer);

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));
expressApp.use(express.json());

expressApp.post("/adduser", upload.single("avatar"), (req, res) => {
    const { username, color, isPlaced, xPos, yPos, Item1, Item2, Item3, Item4, Item5, Item6, mapCell, money, event, auction } = JSON.parse(req.body.user);
    const avatarData = req.file.buffer;

    if (!username) {
        console.log("Имя пользователя не может быть пустым");
        return res.json({ success: false, message: "Имя пользователя не может быть пустым" });
    }

    const checkQuery = "SELECT COUNT(*) AS count FROM users WHERE username = ?";
    db.get(checkQuery, [username.toLowerCase()], (err, row) => {
        if (err) {
            console.log("Error checking username");
            return res.json({ success: false, message: "Ошибка при проверке имени пользователя" });
        }

        if (row.count > 0) {
            console.log("Такое имя пользователя уже занято");
            return res.json({ success: false, message: "Такое имя пользователя уже занято" });
        }

        const insertQuery = "INSERT INTO users (username, color, avatar, isPlaced, xPos, yPos, Item1, Item2, Item3, Item4, Item5, Item6, mapCell, money, event, auction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.run(insertQuery, [username.toLowerCase(), color, avatarData, isPlaced, xPos, yPos, Item1, Item2, Item3, Item4, Item5, Item6, mapCell, money, event, auction], (err) => {
            if (err) {
                console.log("Error adding user", err);
                return res.json({ success: false, message: "Ошибка при добавлении пользователя" });
            }

            console.log("User added successfully");
            return res.json({ success: true, message: "Пользователь успешно добавлен" });
        });
    });
});


expressApp.post("/updateauctionown/:item", (req, res) => {
  const item = req.params.item;
  const { owner } = req.body;

  const updateQuery = "UPDATE auction SET owner = ? WHERE item = ?";
  db.run(updateQuery, [owner, item], (err) => {
    if (err) {
      console.log("Error updating user ownership:", err);
      return res.json({ success: false, message: "Error updating user ownership" });
    }

    console.log("User ownershipd updated successfully");
    return res.json({ success: true, message: "User ownership updated successfully" });
  });
});

expressApp.post("/addgame", (req, res) => {
  const { gameUsername, gameCell, gameTitle, gameStatus, gameCommentary } = req.body;

  if (!gameUsername) {
      return res.status(400).json({ success: false, message: "Game username cannot be empty" });
  }

  const insertQuery = "INSERT INTO games (gameUsername, gameCell, gameTitle, gameStatus, gameCommentary) VALUES (?, ?, ?, ?, ?)";
  db.run(insertQuery, [gameUsername, gameCell, gameTitle, gameStatus, gameCommentary], (err) => {
      if (err) {
          console.log("Error adding game", err);
          return res.status(500).json({ success: false, message: "Error adding game" });
      }

      console.log("Game added successfully");
      return res.json({ success: true, message: "Game added successfully" });
  });
});

expressApp.post("/updateposition/:userId", (req, res) => {
    const userId = req.params.userId;
    const { xPos, yPos, isPlaced } = req.body;
  
    const updateQuery = "UPDATE users SET xPos = ?, yPos = ?, isPlaced = ? WHERE id = ?";
    db.run(updateQuery, [xPos, yPos, isPlaced, userId], (err) => {
      if (err) {
        console.log("Error updating user position and isPlaced:", err);
        return res.json({ success: false, message: "Error updating user position and isPlaced" });
      }
  
      console.log("User position and isPlaced updated successfully");
      return res.json({ success: true, message: "User position and isPlaced updated successfully" });
    });
  });

  expressApp.post("/updatecell/:userId", (req, res) => {
    const userId = req.params.userId;
    const { mapCell } = req.body;
  
    const updateQuery = "UPDATE users SET mapCell = ? WHERE id = ?";
    db.run(updateQuery, [mapCell, userId], (err) => {
      if (err) {
        console.log("Error updating user position and isPlaced:", err);
        return res.json({ success: false, message: "Error updating user position and isPlaced" });
      }
  
      console.log("User position and isPlaced updated successfully");
      return res.json({ success: true, message: "User position and isPlaced updated successfully" });
    });
  });

  expressApp.post("/updategame/:gameId", (req, res) => {
    const gameId = req.params.gameId;
    const { gameTitle, gameCell, gameStatus, gameCommentary } = req.body;
  
    const updateQuery = "UPDATE games SET gameTitle = ?, gameCell = ?, gameStatus = ?, gameCommentary = ? WHERE gameId = ?";
    db.run(updateQuery, [gameTitle, gameCell, gameStatus, gameCommentary, gameId], (err) => {
      if (err) {
        console.log("Error updating game:", err);
        return res.json({ success: false, message: "Error updating game" });
      }
  
      console.log("Game updated successfully");
      return res.json({ success: true, message: "Game updated successfully" });
    });
  });
  expressApp.post("/updateuserdashboard/:username", (req, res) => {
    const username = req.params.username;
    const { color, money, isPlaced, xPos, yPos, Item1, Item2, Item3, Item4, Item5, Item6, auction } = req.body;
  
    const updateQuery = "UPDATE users SET color = ?, money = ?, isPlaced = ?, xPos = ?, yPos = ?, Item1 = ?, Item2 = ?, Item3 = ?, Item4 = ?, Item5 = ?, Item6 = ?, auction = ? WHERE username = ?";
    db.run(updateQuery, [color, money, isPlaced, xPos, yPos, Item1, Item2, Item3, Item4, Item5, Item6, auction, username], (err) => {
      if (err) {
        console.log("Error updating user position and isPlaced:", err);
        return res.json({ success: false, message: "Error updating user position and isPlaced" });
      }
  
      console.log("User position and isPlaced updated successfully");
      return res.json({ success: true, message: "User position and isPlaced updated successfully" });
    });
  });

  expressApp.delete("/deletegame/:gameId", (req, res) => {
    const gameId = req.params.gameId;

    const deleteQuery = "DELETE FROM games WHERE gameId = ?";
    db.run(deleteQuery, [gameId], (err) => {
      if (err) {
        console.log("Error deleting game:", err);
        return res.json({ success: false, message: "Error deleting game" });
      }
  
      console.log("Game deleted successfully");
      return res.json({ success: true, message: "Game deleted successfully" });
    });
  });

  expressApp.post("/updatemoney/:username", (req, res) => {
    const username = req.params.username;
    const { money } = req.body;
  
    const updateQuery = "UPDATE users SET money = ? WHERE username = ?";
    db.run(updateQuery, [money, username], (err) => {
      if (err) {
        console.log("Error updating user money:", err);
        return res.json({ success: false, message: "Error updating user money" });
      }
  
      console.log("User money updated successfully");
      return res.json({ success: true, message: "User money updated successfully" });
    });
  });

  expressApp.post("/updateitems/:username", (req, res) => {
    const username = req.params.username;
    const { Item1, Item2, Item3, Item4, Item5, Item6 } = req.body;
  
    const updateQuery = "UPDATE users SET Item1 = ?, Item2 = ?, Item3 = ?, Item4 = ?, Item5 = ?, Item6 = ? WHERE username = ?";
    db.run(updateQuery, [Item1, Item2, Item3, Item4, Item5, Item6, username], (err) => {
      if (err) {
        console.log("Error updating user items:", err);
        return res.json({ success: false, message: "Error updating user items" });
      }
  
      console.log("User items updated successfully");
      return res.json({ success: true, message: "User items updated successfully" });
    });
  });

  expressApp.post("/updateevents/:username", (req, res) => {
    const username = req.params.username;
    const { event } = req.body;
  
    const updateQuery = "UPDATE users SET event = ? WHERE username = ?";
    db.run(updateQuery, [event, username], (err) => {
      if (err) {
        console.log("Error updating user events:", err);
        return res.json({ success: false, message: "Error updating user events" });
      }
  
      console.log("User events updated successfully");
      return res.json({ success: true, message: "User events updated successfully" });
    });
  });

  expressApp.post("/updateauction/:username", (req, res) => {
    const username = req.params.username;
    const { auction } = req.body;
  
    const updateQuery = "UPDATE users SET auction = ? WHERE username = ?";
    db.run(updateQuery, [auction, username], (err) => {
      if (err) {
        console.log("Error updating user auction:", err);
        return res.json({ success: false, message: "Error updating user auction" });
      }
  
      console.log("User auction updated successfully");
      return res.json({ success: true, message: "User auction updated successfully" });
    });
  });



expressApp.get("/getavatar/:userId", (req, res) => {
    const userId = req.params.userId;
    const query = "SELECT avatar FROM users WHERE id = ?";
    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error("Error fetching user avatar:", err);
            res.status(500).json({ error: "Error fetching user avatar" });
            return;
        }

        if (row && row.avatar) {
            res.contentType("image/*");
            res.send(row.avatar);
        } else {
            console.error("Avatar not found");
            res.status(404).json({ error: "Avatar not found" });
        }
    });
});

expressApp.get("/getuserpicture/:username", (req, res) => {
  const username = req.params.username;
  const query = "SELECT avatar FROM users WHERE username = ?";
  db.get(query, [username], (err, row) => {
      if (err) {
          console.error("Error fetching user avatar:", err);
          res.status(500).json({ error: "Error fetching user avatar" });
          return;
      }

      if (row && row.avatar) {
          res.contentType("image/*");
          res.send(row.avatar);
      } else {
          console.error("Avatar not found");
          res.status(404).json({ error: "Avatar not found" });
      }
  });
});

expressApp.post("/createUserInventory", (req, res) => {
    const { username, color, inventoryFileName } = req.body;

    fs.readFile(path.join(__dirname, "public", "inventoryTemplate.html"), "utf8", (err, templateData) => {
      if (err) {
        console.error("Error reading inventory template:", err);
        res.json({ success: false, message: "Error creating user-specific inventory file." });
        return;
      }

      const userInventoryHTML = templateData
        .replace("{{USERNAME}}", username)
        .replace("{{COLOR}}", color);
  
      const inventoryFilePath = path.join(__dirname, "public", inventoryFileName);
      fs.writeFile(inventoryFilePath, userInventoryHTML, err => {
        if (err) {
          console.error("Error creating user-specific inventory file:", err);
          res.json({ success: false, message: "Error creating user-specific inventory file." });
          return;
        }
  
        console.log("User-specific inventory file created successfully.");
        res.json({ success: true, message: "User-specific inventory file created successfully." });
      });
    });
  });

expressApp.get("/getusers", (req, res) => {
    const query = "SELECT * FROM users";
    db.all(query, (err, rows) => {
        if (err) {
            console.log("Error fetching users");
        }
        res.json(rows);
    });
});

expressApp.get("/getauction", (req, res) => {
  const query = "SELECT * FROM auction";
  db.all(query, (err, rows) => {
      if (err) {
          console.log("Error fetching auction");
      }
      res.json(rows);
  });
});

expressApp.get("/getgames", (req, res) => {
  const query = "SELECT * FROM games";
  db.all(query, (err, rows) => {
      if (err) {
          console.log("Error fetching games");
      }
      res.json(rows);
  });
});

expressApp.get("/", (req, res) => {
    const filePath = path.join(__dirname, "public/index.html");
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading HTML file:", err);
            res.status(500).send("Error reading HTML file");
            return;
        }
        res.send(data);
    });
});

expressApp.get("/getjson1", (req, res) => {
    const jsonFilePath = path.join(__dirname, "public/json/cells.json");
    readAndSendJson(jsonFilePath, res);
});

expressApp.get("/getjson2", (req, res) => {
  const jsonFilePath = path.join(__dirname, "public/json/items.json");
  readAndSendJson(jsonFilePath, res);
});

expressApp.get("/getjson3", (req, res) => {
  const jsonFilePath = path.join(__dirname, "public/json/steamdb.json");
  readAndSendJson(jsonFilePath, res);
});

function readAndSendJson(filePath, response) {
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading JSON file:", err);
            response.status(500).json({ error: "Error reading JSON file" });
            return;
        }
        const jsonData = JSON.parse(data);
        response.json(jsonData);
    });
}


expressApp.get("/socket.io/socket.io.js", (req, res) => {
    res.sendFile(path.join(__dirname, "/node_modules/socket.io/client-dist/socket.io.js"));
  });

 

  io.on("connection", (socket) => {
    console.log("A user connected");
  
    socket.on("move", (data) => {
      io.emit("move", data);
    });
  
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });

  httpServer.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}`);
  });