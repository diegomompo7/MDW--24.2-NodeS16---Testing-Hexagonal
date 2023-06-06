import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Player } from "./Players";

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    name!: string;

  @Column()
    city!: string;

  // JUGADORES
  @OneToMany(type => Player, player => player.team, { cascade: true })
    players!: Player[];
}
