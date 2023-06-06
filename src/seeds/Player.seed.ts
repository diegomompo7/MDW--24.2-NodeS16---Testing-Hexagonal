import { AppDataSource } from "../databases/typeorm-datasource";
import { Player } from "../models/typeorm/Players";

export const playerSeed = async (): Promise<void> => {
  // Nos conectamos a la BBDD
  const dataSource = await AppDataSource.initialize();
  console.log(`Tenemos conexión!! Conectados a ${dataSource?.options?.database as string}`);

  // Eliminamos los datos existentes
  await AppDataSource.manager.delete(Player, {});
  console.log("Eliminados jugadores existentes");

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
  await AppDataSource.manager.save(player1Entity);
  await AppDataSource.manager.save(player2Entity);

  console.log("Creados los dos jugadores");

  // Cerramos la conexión
  await AppDataSource.destroy();
  console.log("Cerrada conexión SQL");
}

void playerSeed();
