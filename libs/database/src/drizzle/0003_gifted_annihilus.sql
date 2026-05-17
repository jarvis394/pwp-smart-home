ALTER TABLE "scenarios" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE "scenarios" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;