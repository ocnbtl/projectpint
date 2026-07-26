begin;

create table if not exists public.affiliate_products (
  id text primary key,
  slug text not null unique,
  asin text not null unique,
  canonical_amazon_url text not null unique,
  associates_url text,
  brand text not null,
  manufacturer text,
  category text not null,
  product_name text not null,
  recommendation text not null default 'approve'
    check (recommendation in ('approve', 'approve_with_caveat', 'replace')),
  recommendation_rationale text not null default '',
  caveats jsonb not null default '[]'::jsonb check (jsonb_typeof(caveats) = 'array'),
  workflow_status text not null default 'research'
    check (workflow_status in (
      'research', 'needs_approval', 'approved', 'reference_ready', 'generating',
      'generation_failed', 'media_qa', 'publish_ready', 'published', 'unavailable', 'retired'
    )),
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'approved_with_caveat', 'rejected')),
  approval_history jsonb not null default '[]'::jsonb
    check (jsonb_typeof(approval_history) = 'array'),
  availability_status text not null default 'uncertain'
    check (availability_status in ('verified_available', 'uncertain', 'unavailable')),
  availability_observed_at timestamptz,
  price_observation jsonb,
  reference_readiness text not null default 'missing'
    check (reference_readiness in ('missing', 'partial', 'ready', 'blocked_rights')),
  media_completeness text not null default 'not_started'
    check (media_completeness in ('not_started', 'partial', 'complete')),
  image_qa_status text not null default 'not_started'
    check (image_qa_status in ('not_started', 'in_progress', 'passed', 'failed')),
  publication_readiness text not null default 'blocked'
    check (publication_readiness in ('blocked', 'ready')),
  visibility text not null default 'private'
    check (visibility in ('private', 'preview', 'public')),
  is_unavailable boolean not null default false,
  is_retired boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint affiliate_products_id_shape check (id ~ '^prod_[a-z0-9_]+$'),
  constraint affiliate_products_slug_shape check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint affiliate_products_asin_shape check (asin ~ '^[A-Z0-9]{10}$'),
  constraint affiliate_products_canonical_url_shape
    check (canonical_amazon_url ~ '^https://([a-z0-9-]+\.)*amazon\.com/(dp|gp/product)/[A-Z0-9]{10}([/?].*)?$'),
  constraint affiliate_products_associates_url_shape
    check (
      associates_url is null
      or associates_url ~ '^https://([a-z0-9-]+\.)*(amazon\.com|amzn\.to)/'
    ),
  constraint affiliate_products_publication_gate
    check (
      visibility <> 'public'
      or (
        approval_status in ('approved', 'approved_with_caveat')
        and associates_url is not null
        and publication_readiness = 'ready'
        and media_completeness = 'complete'
        and image_qa_status = 'passed'
        and not is_unavailable
        and not is_retired
      )
    )
);

create table if not exists public.affiliate_product_research_sources (
  id bigint generated always as identity primary key,
  product_id text not null references public.affiliate_products(id) on delete cascade,
  source_type text not null
    check (source_type in ('amazon', 'manufacturer', 'retailer', 'editorial', 'community', 'video')),
  title text not null,
  source_url text not null,
  observed_at timestamptz not null,
  private_reference_only boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (product_id, source_url)
);

create table if not exists public.affiliate_product_style_assignments (
  product_id text not null references public.affiliate_products(id) on delete cascade,
  style_slug text not null
    check (style_slug in (
      'minimalist-elegance', 'modern-marble', 'spa-greenery', 'brass-terrazzo',
      'boho-earth-tones', 'scandinavian-clean', 'dark-moody', 'warm-editorial',
      'industrial-loft', 'coastal-calm', 'japandi', 'vintage-eclectic'
    )),
  assignment_role text not null check (assignment_role in ('primary', 'additional')),
  rank integer not null check (rank between 1 and 100),
  rationale text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, style_slug)
);

create unique index if not exists affiliate_product_one_primary_style
  on public.affiliate_product_style_assignments(product_id)
  where assignment_role = 'primary';

create table if not exists public.affiliate_product_media_sets (
  id bigint generated always as identity primary key,
  product_id text not null references public.affiliate_products(id) on delete cascade,
  set_kind text not null check (set_kind in ('presentation', 'styled')),
  style_slug text,
  expected_count integer not null check (expected_count in (1, 5)),
  ready_count integer not null default 0 check (ready_count >= 0 and ready_count <= expected_count),
  status text not null default 'not_started'
    check (status in ('not_started', 'queued', 'generating', 'partial', 'failed', 'qa', 'ready', 'retired')),
  prompt_version text not null,
  generation_version text,
  qa_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint affiliate_media_set_shape check (
    (set_kind = 'presentation' and style_slug is null and expected_count = 1)
    or (set_kind = 'styled' and style_slug is not null and expected_count = 5)
  ),
  unique nulls not distinct (product_id, set_kind, style_slug)
);

create table if not exists public.affiliate_product_media_assets (
  id bigint generated always as identity primary key,
  media_set_id bigint not null references public.affiliate_product_media_sets(id) on delete cascade,
  slot integer not null check (slot between 1 and 5),
  storage_key text not null unique,
  public_url text,
  alt_text text not null default '',
  status text not null default 'planned'
    check (status in ('planned', 'generated', 'failed', 'qa_passed', 'qa_failed', 'retired')),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  content_hash text,
  prompt_version text not null,
  generation_version text,
  qa_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (media_set_id, slot)
);

create table if not exists public.affiliate_scenes (
  id text primary key,
  slug text not null unique,
  style_slug text not null,
  title text not null,
  scene_media_url text,
  scene_alt_text text not null default '',
  workflow_status text not null default 'draft'
    check (workflow_status in ('draft', 'generating', 'qa', 'ready', 'published', 'retired')),
  visibility text not null default 'private'
    check (visibility in ('private', 'preview', 'public')),
  prompt_version text,
  generation_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_scene_products (
  scene_id text not null references public.affiliate_scenes(id) on delete cascade,
  product_id text not null references public.affiliate_products(id) on delete restrict,
  display_order integer not null check (display_order between 1 and 12),
  hotspot_x numeric(6, 3) check (hotspot_x is null or hotspot_x between 0 and 100),
  hotspot_y numeric(6, 3) check (hotspot_y is null or hotspot_y between 0 and 100),
  hotspot_label text not null default '',
  primary key (scene_id, product_id),
  unique (scene_id, display_order)
);

create index if not exists affiliate_products_workflow_idx
  on public.affiliate_products(workflow_status, approval_status, visibility);
create index if not exists affiliate_products_category_idx
  on public.affiliate_products(category);
create index if not exists affiliate_style_assignments_style_idx
  on public.affiliate_product_style_assignments(style_slug, rank);
create index if not exists affiliate_media_assets_status_idx
  on public.affiliate_product_media_assets(status);

alter table public.affiliate_products enable row level security;
alter table public.affiliate_product_research_sources enable row level security;
alter table public.affiliate_product_style_assignments enable row level security;
alter table public.affiliate_product_media_sets enable row level security;
alter table public.affiliate_product_media_assets enable row level security;
alter table public.affiliate_scenes enable row level security;
alter table public.affiliate_scene_products enable row level security;

revoke all on table public.affiliate_products from anon, authenticated;
revoke all on table public.affiliate_product_research_sources from anon, authenticated;
revoke all on table public.affiliate_product_style_assignments from anon, authenticated;
revoke all on table public.affiliate_product_media_sets from anon, authenticated;
revoke all on table public.affiliate_product_media_assets from anon, authenticated;
revoke all on table public.affiliate_scenes from anon, authenticated;
revoke all on table public.affiliate_scene_products from anon, authenticated;
revoke all on sequence public.affiliate_product_research_sources_id_seq from anon, authenticated;
revoke all on sequence public.affiliate_product_media_sets_id_seq from anon, authenticated;
revoke all on sequence public.affiliate_product_media_assets_id_seq from anon, authenticated;

commit;
