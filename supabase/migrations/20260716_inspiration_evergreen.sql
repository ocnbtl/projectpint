-- Project Pint inspiration content readiness.
-- This migration creates the server-only Inspiration_Evergreen store.
-- It does not create, update, or delete editorial rows.

create table if not exists public.inspiration_evergreen (
  "Inspiration_ID" text primary key,
  "Inspiration_Publish_Date" text not null default '',
  "Inspiration_Publish_Time" text not null default '',
  "Content_Area" text not null default '',
  "Workflow_Status" text not null default '',
  "Inspiration_URL" text not null default '',
  "Inspiration_Title" text not null default '',
  "Inspiration_Style" text not null default '',
  "Inspiration_Tags" text not null default '',
  "Inspiration_Description" text not null default '',
  "Inspiration_Body" text not null default '',
  "Hero_Image_URL" text not null default '',
  "Hero_Alt_Text" text not null default '',
  "Hero_Caption" text not null default '',
  "Hero_Credit" text not null default '',
  "Hero_Rights_Status" text not null default 'unverified',
  "SEO_Title" text not null default '',
  "SEO_Description" text not null default '',
  "Canonical_URL" text not null default '',
  "Social_Image_URL" text not null default '',
  "Indexable" text not null default 'true',
  "Published_To_Public_At" text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_inspiration_evergreen_updated_at on public.inspiration_evergreen;
create trigger trg_inspiration_evergreen_updated_at
before update on public.inspiration_evergreen
for each row
execute function public.set_row_updated_at();

alter table public.inspiration_evergreen enable row level security;
revoke all privileges on table public.inspiration_evergreen from anon, authenticated;
