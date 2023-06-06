import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Team } from "./Team";

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    firstName!: string;

  @Column()
    lastName!: string;

  @Column()
    shirtNumber!: number;

  @ManyToOne(type => Team, team => team.players)
    team!: Team;
}
