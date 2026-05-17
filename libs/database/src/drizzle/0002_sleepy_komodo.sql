ALTER TABLE "devices" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE "devices" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;