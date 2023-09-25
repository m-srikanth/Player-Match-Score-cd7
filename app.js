const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initiatingDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("It's Running...");
    });
  } catch (e) {
    console.log(`Error is ${e.message}`);
    process.exit(1);
  }
};
initiatingDB();

//API-1
app.get("/players/", async (request, response) => {
  const query = `SELECT * FROM player_details;`;
  const array = await db.all(query);
  const result = (i) => {
    return {
      playerId: i.player_id,
      playerName: i.player_name,
    };
  };
  response.send(array.map((i) => result(i)));
});
//API-2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const array = await db.get(query);
  const result = {
    playerId: array.player_id,
    playerName: array.player_name,
  };
  response.send(result);
});
//API-3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const query = `UPDATE player_details SET player_name = '${playerName}' WHERE player_id = ${playerId};`;
  const array = await db.run(query);
  response.send("Player Details Updated");
});
//API-4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const query = `SELECT * FROM match_details WHERE match_id = ${matchId};`;
  const array = await db.get(query);
  const result = {
    matchId: array.match_id,
    match: array.match,
    year: array.year,
  };
  response.send(result);
});
//API-5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * FROM player_match_score 
        INNER JOIN match_details ON player_match_score.match_id = match_details.match_id 
        WHERE player_id = ${playerId}`;
  const array = await db.all(query);
  const result = (i) => {
    return {
      matchId: i.match_id,
      match: i.match,
      year: i.year,
    };
  };
  response.send(array.map((i) => result(i)));
});
//API-6
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const query = `SELECT * FROM player_details INNER JOIN player_match_score 
        ON player_details.player_id = player_match_score.player_id 
        WHERE match_id = ${matchId};`;
  const array = await db.all(query);
  const result = (i) => {
    return {
      playerId: i.player_id,
      playerName: i.player_name,
    };
  };
  response.send(array.map((i) => result(i)));
});
//API-7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT player_id, player_name, SUM(score) AS sc, SUM(fours) AS fo, SUM(sixes) AS si FROM player_details NATURAL JOIN player_match_score 
        WHERE player_id = ${playerId}`;
  const array = await db.get(query);
  const result = {
    playerId: array.player_id,
    playerName: array.player_name,
    totalScore: array.sc,
    totalFours: array.fo,
    totalSixes: array.si,
  };
  response.send(result);
});
module.exports = app;
