CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"password" varchar(256) NOT NULL,
	"first_name" varchar(128) NOT NULL,
	"last_name" varchar(128),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "apartments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"location" varchar(256) NOT NULL,
	"user_id" varchar NOT NULL
);

CREATE TABLE "rooms" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"location" varchar(256) NOT NULL,
	"apartment_id" varchar NOT NULL
);

CREATE TABLE "devices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(512) NOT NULL,
	"model" varchar(512),
	"favorite" boolean DEFAULT false NOT NULL,
	"type" varchar DEFAULT 'basic' NOT NULL,
	"capabilities" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"state" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"user_id" varchar NOT NULL,
	"room_id" varchar
);

CREATE TABLE "scenarios" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(512) NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"actions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"user_id" varchar NOT NULL
);

ALTER TABLE "apartments" ADD CONSTRAINT "apartments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_apartment_id_apartments_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."apartments"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "devices" ADD CONSTRAINT "devices_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;