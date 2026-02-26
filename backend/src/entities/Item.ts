import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Checklist } from './Checklist';

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'boolean', default: false })
  isChecked!: boolean;

  @Column({ type: 'text', nullable: true })
  url?: string | null;

  @Column({ type: 'float', nullable: true })
  quantity?: number | null;

  @ManyToOne(() => Checklist, (checklist) => checklist.items, { onDelete: 'CASCADE' })
  checklist!: Checklist;
}
