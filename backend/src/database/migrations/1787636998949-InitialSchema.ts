import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1787636998949 implements MigrationInterface {
    name = 'InitialSchema1787636998949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(120) NOT NULL, "slug" character varying(140) NOT NULL, "description" text, "icon" character varying(60), "color" character varying(9), "is_active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_420d9f679d41281f282f5bc7d0" ON "categories" ("slug") `);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(180) NOT NULL, "description" text NOT NULL, "category_id" uuid NOT NULL, "price" numeric(12,2) NOT NULL, "currency" character varying(3) NOT NULL DEFAULT 'TRY', "city" character varying(120) NOT NULL, "district" character varying(120), "address" character varying(300), "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, "duration_minutes" integer NOT NULL DEFAULT '60', "tags" text array NOT NULL DEFAULT '{}'::text[], "image_url" character varying(500), "booking_url" character varying(500), "is_active" boolean NOT NULL DEFAULT true, "is_ai_recommendable" boolean NOT NULL DEFAULT true, "rating" numeric(3,2) NOT NULL DEFAULT '0', "review_count" integer NOT NULL DEFAULT '0', "popularity_score" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7c3e6ba6ad937def2dd8ffcff3" ON "products" ("is_ai_recommendable", "is_active") `);
        await queryRunner.query(`CREATE INDEX "IDX_abdfa6fd5f87a5d4811060e53a" ON "products" ("city", "is_active") `);
        await queryRunner.query(`CREATE TYPE "public"."route_stops_type_enum" AS ENUM('ai_suggestion', 'viofun_product')`);
        await queryRunner.query(`CREATE TABLE "route_stops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "route_id" uuid NOT NULL, "day_number" integer NOT NULL, "order_index" integer NOT NULL, "title" character varying(200) NOT NULL, "description" text, "type" "public"."route_stops_type_enum" NOT NULL DEFAULT 'ai_suggestion', "product_id" uuid, "latitude" double precision, "longitude" double precision, "address" character varying(300), "start_time" character varying(5), "duration_minutes" integer NOT NULL DEFAULT '60', "estimated_cost" numeric(12,2), "category_label" character varying(120), "is_included" boolean NOT NULL DEFAULT true, "match_score" numeric(5,2), "match_reason" text, "booking_url" character varying(500), CONSTRAINT "PK_22c09afc24c0a7a13644c629073" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f7bf53201e991dde1f88477161" ON "route_stops" ("route_id", "day_number", "order_index") `);
        await queryRunner.query(`CREATE TYPE "public"."routes_transport_mode_enum" AS ENUM('walking', 'public_transport', 'car', 'bike', 'mixed')`);
        await queryRunner.query(`CREATE TYPE "public"."routes_pace_enum" AS ENUM('relaxed', 'balanced', 'intense')`);
        await queryRunner.query(`CREATE TYPE "public"."routes_status_enum" AS ENUM('draft', 'generating', 'ready', 'failed', 'archived')`);
        await queryRunner.query(`CREATE TABLE "routes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, "title" character varying(200) NOT NULL, "summary" text, "city" character varying(120) NOT NULL, "start_date" date, "days" integer NOT NULL, "budget" numeric(12,2) NOT NULL DEFAULT '0', "currency" character varying(3) NOT NULL DEFAULT 'TRY', "travelers" integer NOT NULL DEFAULT '1', "interests" text array NOT NULL DEFAULT '{}'::text[], "transport_mode" "public"."routes_transport_mode_enum" NOT NULL DEFAULT 'mixed', "pace" "public"."routes_pace_enum" NOT NULL DEFAULT 'balanced', "status" "public"."routes_status_enum" NOT NULL DEFAULT 'ready', "estimated_cost" numeric(12,2), "center_latitude" double precision, "center_longitude" double precision, "ai_model" character varying(120), "generation_ms" integer, CONSTRAINT "PK_76100511cdfa1d013c859f01d8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_48579db497ec54d1e89012c4f6" ON "routes" ("user_id", "created_at") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "full_name" character varying(120) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "is_active" boolean NOT NULL DEFAULT true, "avatar_url" character varying(500), "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb, "refresh_token_hash" character varying(255), "last_login_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(120) NOT NULL, "description" text, "key_prefix" character varying(32) NOT NULL, "key_hash" character varying(255) NOT NULL, "scopes" text array NOT NULL DEFAULT '{}'::text[], "is_active" boolean NOT NULL DEFAULT true, "expires_at" TIMESTAMP WITH TIME ZONE, "last_used_at" TIMESTAMP WITH TIME ZONE, "created_by_id" uuid, CONSTRAINT "PK_5c8a79801b44bd27b79228e1dad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b99bbb8e545065a99b409dbc5d" ON "api_keys" ("key_prefix") `);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route_stops" ADD CONSTRAINT "FK_b16cab5c66870949cbb4ee748c0" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "route_stops" ADD CONSTRAINT "FK_32d4aa77cfcf8977187a207989e" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "FK_e75937499deab9df1eba04724f1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "api_keys" ADD CONSTRAINT "FK_3afd227c6cb003779abe2a88b4e" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "api_keys" DROP CONSTRAINT "FK_3afd227c6cb003779abe2a88b4e"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "FK_e75937499deab9df1eba04724f1"`);
        await queryRunner.query(`ALTER TABLE "route_stops" DROP CONSTRAINT "FK_32d4aa77cfcf8977187a207989e"`);
        await queryRunner.query(`ALTER TABLE "route_stops" DROP CONSTRAINT "FK_b16cab5c66870949cbb4ee748c0"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b99bbb8e545065a99b409dbc5d"`);
        await queryRunner.query(`DROP TABLE "api_keys"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48579db497ec54d1e89012c4f6"`);
        await queryRunner.query(`DROP TABLE "routes"`);
        await queryRunner.query(`DROP TYPE "public"."routes_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."routes_pace_enum"`);
        await queryRunner.query(`DROP TYPE "public"."routes_transport_mode_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7bf53201e991dde1f88477161"`);
        await queryRunner.query(`DROP TABLE "route_stops"`);
        await queryRunner.query(`DROP TYPE "public"."route_stops_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_abdfa6fd5f87a5d4811060e53a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7c3e6ba6ad937def2dd8ffcff3"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_420d9f679d41281f282f5bc7d0"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
