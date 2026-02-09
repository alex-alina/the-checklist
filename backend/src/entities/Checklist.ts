import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Item } from './Item';

@Entity()
export class Checklist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @OneToMany(() => Item, (item) => item.checklist, {
    cascade: ['insert', 'update'],
    eager: true
  })
  items!: Item[];
}
