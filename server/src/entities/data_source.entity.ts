import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn, AfterUpdate, Repository, AfterInsert, createQueryBuilder, getRepository, OneToMany, OneToOne, AfterLoad, BaseEntity, } from 'typeorm';
import { App } from './app.entity';

@Entity({ name: "data_sources" })
export class DataSource extends BaseEntity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column( { name: 'name' } )
  name: string;

  @Column( { name: 'kind' } )
  kind: string;

  @Column('simple-json', { name: 'options' }) 
  options

  @Column({ name: 'app_id' }) 
  appId: string

  @CreateDateColumn({ default: () => 'now()', name: 'created_at' })
  createdAt: Date;
  
  @UpdateDateColumn({ default: () => 'now()', name: 'updated_at' })
  updatedAt: Date;
  
  @ManyToOne(() => App, app => app.id)
  @JoinColumn({ name: "app_id" })
  app: App;

}
