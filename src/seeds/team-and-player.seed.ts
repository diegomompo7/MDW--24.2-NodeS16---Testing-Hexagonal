import { AppDataSource } from "../databases/typeorm-datasource";
import { Player } from "../models/typeorm/Players";
import { Team } from "../models/typeorm/Team";

export const teamAndPlayerSeed = async (): Promise<void> => {
  // Nos conectamos a la BBDD
  const dataSource = await AppDataSource.initialize();
  console.log(`Tenemos conexión!! Conectados a ${dataSource?.options?.database as string}`);

  // Eliminamos los datos existentes
  await AppDataSource.manager.delete(Player, {});
  await AppDataSource.manager.delete(Team, {});
  console.log("Eliminados jugadores y equipos");

  // Creamos dos players
  const player1 = {
    firstName: "Cristiano",
    lastName: "Ronaldo",
    shirtNumber: 7
  };

  const player2 = {
    firstName: "Lionel",
    lastName: "Messi",
    shirtNumber: 10
  };

  // Creamos las entidades
  const player1Entity = AppDataSource.manager.create(Player, player1);
  const player2Entity = AppDataSource.manager.create(Player, player2);

  // Las guardamos en base de datos
  // await AppDataSource.manager.save(player1Entity);
  // await AppDataSource.manager.save(player2Entity);

  // Creamos equipo
  const team = {
    name: "Dream Team",
    city: "Madrid",
    players: [player1Entity, player2Entity]
  };

  // Creamos entidad equipo
  const teamEntity = AppDataSource.manager.create(Team, team);

  // Guardamos el equipo en BBDD
  await AppDataSource.manager.save(teamEntity);

  console.log("Creados los dos jugadores y equipo");

  // Cerramos la conexión
  await AppDataSource.destroy();
  console.log("Cerrada conexión SQL");
}

void teamAndPlayerSeed();
