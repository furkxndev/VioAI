import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductVenueAndAge1788100000000 implements MigrationInterface {
  name = 'AddProductVenueAndAge1788100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."products_venue_setting_enum" AS ENUM('indoor', 'outdoor', 'mixed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."products_attribute_source_enum" AS ENUM('explicit', 'inferred', 'unknown')`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "venue_setting" "public"."products_venue_setting_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "products" ADD "min_age" integer`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "attribute_source" "public"."products_attribute_source_enum" NOT NULL DEFAULT 'unknown'`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "attribute_evidence" character varying(400)`,
    );
    // Sohbet sorgusu her zaman şehir + kapalı alan + yaş üzerinden filtreler.
    await queryRunner.query(
      `CREATE INDEX "IDX_products_city_venue_setting" ON "products" ("city", "venue_setting")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_products_city_venue_setting"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "attribute_evidence"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "attribute_source"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "min_age"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "venue_setting"`);
    await queryRunner.query(`DROP TYPE "public"."products_attribute_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."products_venue_setting_enum"`);
  }
}
