import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDesc1742306099845 implements MigrationInterface {
    name = 'AddDesc1742306099845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" ADD "description" text NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "description"`);
    }

}
