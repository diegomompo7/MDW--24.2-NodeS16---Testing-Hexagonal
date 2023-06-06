import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { Player } from "../models/typeorm/Players";
import { AppDataSource } from "../databases/typeorm-datasource";
import { type Repository } from "typeorm";
import { Team } from "../models/typeorm/Team";

const playerRepository: Repository<Player> = AppDataSource.getRepository(Player);
const teamRepository: Repository<Team> = AppDataSource.getRepository(Team);

// Router
export const playerRouter = Router();

// CRUD: READ
playerRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const players: Player[] = await playerRepository.find({ relations: ["team"] });
    res.json(players);
  } catch (error) {
    next(error);
  }
});

playerRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const player = await playerRepository.findOne({
      where: {
        id: idReceivedInParams
      },
      relations: ["team"]
    });

    if (!player) {
      res.status(404).json({ error: "Player not found" });
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
});
// CRUD: CREATE
playerRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Construimos player
    const newPlayer = new Player();

    let teamOfPlayer;

    if (req.body.teamId) {
      teamOfPlayer = await teamRepository.findOne({
        where: {
          id: req.body.teamId
        }
      });

      if (!teamOfPlayer) {
        res.status(404).json({ error: "Team not found" });
        return;
      }
    } // Asignamos valores
    Object.assign(newPlayer, {
      ...req.body,
      team: teamOfPlayer
    });

    const playerSaved = await playerRepository.save(newPlayer);
    res.status(201).json(playerSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
playerRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const playerToRemove = await playerRepository.findOneBy({
      id: idReceivedInParams
    });

    if (!playerToRemove) {
      res.status(404).json({ error: "Player not found" });
    } else {
      await playerRepository.remove(playerToRemove);
      res.json(playerToRemove);
    }
  } catch (error) {
    next(error);
  }
});

playerRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const playerToUpdate = await playerRepository.findOneBy({
      id: idReceivedInParams
    });

    if (!playerToUpdate) {
      res.status(404).json({ error: "Player not found" });
    } else {
      let teamOfPlayer;

      if (req.body.teamId) {
        teamOfPlayer = await teamRepository.findOne({
          where: {
            id: req.body.teamId
          }
        });

        if (!teamOfPlayer) {
          res.status(404).json({ error: "Team not found" });
          return;
        }
      }

      // Asignamos valores
      Object.assign(playerToUpdate, {
        ...req.body,
        team: teamOfPlayer
      });

      const updatedPlayer = await playerRepository.save(playerToUpdate);
      res.json(updatedPlayer);
    }
  } catch (error) {
    next(error);
  }
});
