import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ObservationTypeModule } from './observation-type/observation-type.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    ObservationTypeModule,
    UserModule,
    TypeOrmModule.forRoot(
      {
        type: 'postgres', // type of our database
        host: 'localhost', // database host
        port: 5555, // database host
        username: 'postgres', // username
        password: 'pass123', // user password
        database: 'postgres', // name of our database,
        autoLoadEntities: true, // models will be loaded automatically 
        synchronize: true, // your entities will be synced with the database(recommended: disable in prod)
      }
    )
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
