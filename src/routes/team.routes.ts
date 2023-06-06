import { Router, type NextFunction, type Request, type Response } from "express";

// Typeorm
import { Team } from "../models/typeorm/Team";
import { AppDataSource } from "../databases/typeorm-datasource";
import { type Repository } from "typeorm";

const teamRepository: Repository<Team> = AppDataSource.getRepository(Team);

// Router
export const teamRouter = Router();

// CRUD: READ
teamRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teams: Team[] = await teamRepository.find({ relations: ["players"] });
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

teamRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const team = await teamRepository.findOne({
      where: {
        id: idReceivedInParams
      },
      relations: ["players"]
    });

    if (!team) {
      res.status(404).json({ error: "Team not found" });
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
});

// CRUD: CREATE
teamRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Construimos team
    const newTeam = new Team();

    // Asignamos valores
    Object.assign(newTeam, req.body);

    const teamSaved = await teamRepository.save(newTeam);

    res.status(201).json(teamSaved);
  } catch (error) {
    next(error);
  }
});

// CRUD: DELETE
teamRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const teamToRemove = await teamRepository.findOne({
      where: {
        id: idReceivedInParams
      },
      relations: ["players"]
    });

    if (!teamToRemove) {
      res.status(404).json({ error: "Team not found" });
    } else {
      // Quitar a los jugadores este equipo
      for (const player of teamToRemove.players) {
        player.team = null as any;
        await AppDataSource.manager.save(player);
      }

      await teamRepository.remove(teamToRemove);
      res.json(teamToRemove);
    }
  } catch (error) {
    next(error);
  }
});

teamRouter.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idReceivedInParams = parseInt(req.params.id);

    const teamToUpdate = await teamRepository.findOneBy({
      id: idReceivedInParams
    });

    if (!teamToUpdate) {
      res.status(404).json({ error: "Team not found" });
    } else {
      // Asignamos valores
      Object.assign(teamToUpdate, req.body);

      const updatedTeam = await teamRepository.save(teamToUpdate);
      res.json(updatedTeam);
    }
  } catch (error) {
    next(error);
  }
});
