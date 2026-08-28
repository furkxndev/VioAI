import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductEmbedding1788000000000 implements MigrationInterface {
  name = 'AddProductEmbedding1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "embedding" real array`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "embedding_model" character varying(120)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "embedding_model"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "embedding"`);
  }
}
