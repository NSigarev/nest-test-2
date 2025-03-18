import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: configService.get("DB_HOST"),
  port: configService.get<number>("DB_PORT"),
  username: configService.get("DB_ADMIN_LOGIN"),
  password: configService.get("DB_ADMIN_PASSWORD"),
  database: configService.get("DB_DATABASE_NAME"),
  synchronize: false,
  entities: [__dirname + "/../**/*.entity.{js,ts}"],
  migrations: [__dirname + "/../migration/*{.ts,.js}"],
});
