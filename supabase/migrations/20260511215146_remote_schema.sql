drop extension if exists "pg_net";


  create table "public"."aluno_fichas" (
    "aluno_id" uuid not null,
    "ficha_id" uuid not null,
    "ativo" boolean default true,
    "enviado_em" timestamp without time zone default now()
      );


alter table "public"."aluno_fichas" enable row level security;


  create table "public"."alunos" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "nome" character varying(200) not null,
    "email" character varying(200) not null,
    "senha_hash" character varying(255) not null,
    "instrutor_id" uuid,
    "peso" numeric(5,1),
    "peso_inicial" numeric(5,1),
    "altura" integer,
    "percentual_gordura" numeric(4,1),
    "objetivo" character varying(50),
    "nivel_treino" character varying(20) default 'iniciante'::character varying,
    "nivel_gamif" integer default 1,
    "xp" integer default 0,
    "ativo" boolean default true,
    "push_token" character varying(255),
    "criado_em" timestamp without time zone default now(),
    "atualizado_em" timestamp without time zone default now()
      );


alter table "public"."alunos" enable row level security;


  create table "public"."chat_camila" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "aluno_id" uuid,
    "remetente" character varying(10),
    "conteudo" text not null,
    "criado_em" timestamp without time zone default now()
      );


alter table "public"."chat_camila" enable row level security;


  create table "public"."evolucao" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "aluno_id" uuid,
    "data" date default CURRENT_DATE,
    "peso" numeric(5,1),
    "gordura" numeric(4,1),
    "observacao" text,
    "criado_em" timestamp without time zone default now()
      );


alter table "public"."evolucao" enable row level security;


  create table "public"."exercicios" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "ficha_id" uuid,
    "nome" character varying(200) not null,
    "grupo_muscular" character varying(100),
    "series" character varying(10),
    "repeticoes" character varying(20),
    "descanso" character varying(20),
    "observacao" text,
    "ordem" integer default 0
      );


alter table "public"."exercicios" enable row level security;


  create table "public"."faturas" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "instrutor_id" uuid,
    "aluno_id" uuid,
    "tipo" character varying(50) not null,
    "descricao" character varying(255),
    "valor" numeric(10,2) not null,
    "status" character varying(20) default 'pendente'::character varying,
    "vencimento" date not null,
    "pago_em" timestamp without time zone,
    "metodo_pag" character varying(50),
    "externo_id" character varying(255),
    "criado_em" timestamp without time zone default now(),
    "atualizado_em" timestamp without time zone default now()
      );


alter table "public"."faturas" enable row level security;


  create table "public"."fichas_treino" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "instrutor_id" uuid,
    "titulo" character varying(200) not null,
    "descricao" text,
    "nivel" character varying(20),
    "duracao_min" integer,
    "criado_em" timestamp without time zone default now(),
    "atualizado_em" timestamp without time zone default now()
      );


alter table "public"."fichas_treino" enable row level security;


  create table "public"."instrutores" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "nome" character varying(200) not null,
    "email" character varying(200) not null,
    "senha_hash" character varying(255) not null,
    "cref" character varying(50),
    "telefone" character varying(20),
    "pix_chave" character varying(200),
    "codigo_convite" character varying(20) not null,
    "plano" character varying(20) default 'free'::character varying,
    "ativo" boolean default true,
    "criado_em" timestamp without time zone default now(),
    "atualizado_em" timestamp without time zone default now(),
    "email_verificado" boolean default true,
    "codigo_verificacao" character varying(6),
    "codigo_expira" timestamp without time zone
      );


alter table "public"."instrutores" enable row level security;


  create table "public"."notificacoes" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "aluno_id" uuid,
    "tipo" character varying(50),
    "titulo" character varying(200),
    "corpo" text,
    "lida" boolean default false,
    "criado_em" timestamp without time zone default now()
      );


alter table "public"."notificacoes" enable row level security;


  create table "public"."sessoes_treino" (
    "id" uuid not null default extensions.uuid_generate_v4(),
    "aluno_id" uuid,
    "ficha_id" uuid,
    "iniciado_em" timestamp without time zone default now(),
    "finalizado_em" timestamp without time zone,
    "xp_ganho" integer default 0
      );


alter table "public"."sessoes_treino" enable row level security;

CREATE UNIQUE INDEX aluno_fichas_pkey ON public.aluno_fichas USING btree (aluno_id, ficha_id);

CREATE UNIQUE INDEX alunos_email_key ON public.alunos USING btree (email);

CREATE UNIQUE INDEX alunos_pkey ON public.alunos USING btree (id);

CREATE UNIQUE INDEX chat_camila_pkey ON public.chat_camila USING btree (id);

CREATE UNIQUE INDEX evolucao_pkey ON public.evolucao USING btree (id);

CREATE UNIQUE INDEX exercicios_pkey ON public.exercicios USING btree (id);

CREATE UNIQUE INDEX faturas_pkey ON public.faturas USING btree (id);

CREATE UNIQUE INDEX fichas_treino_pkey ON public.fichas_treino USING btree (id);

CREATE INDEX idx_alunos_instrutor ON public.alunos USING btree (instrutor_id);

CREATE INDEX idx_chat_camila_aluno ON public.chat_camila USING btree (aluno_id);

CREATE INDEX idx_evolucao_aluno ON public.evolucao USING btree (aluno_id);

CREATE INDEX idx_exercicios_ficha ON public.exercicios USING btree (ficha_id);

CREATE INDEX idx_faturas_aluno ON public.faturas USING btree (aluno_id);

CREATE INDEX idx_faturas_instrutor ON public.faturas USING btree (instrutor_id);

CREATE INDEX idx_faturas_status ON public.faturas USING btree (status);

CREATE INDEX idx_notificacoes_aluno ON public.notificacoes USING btree (aluno_id);

CREATE INDEX idx_sessoes_aluno ON public.sessoes_treino USING btree (aluno_id);

CREATE UNIQUE INDEX instrutores_codigo_convite_key ON public.instrutores USING btree (codigo_convite);

CREATE UNIQUE INDEX instrutores_email_key ON public.instrutores USING btree (email);

CREATE UNIQUE INDEX instrutores_pkey ON public.instrutores USING btree (id);

CREATE UNIQUE INDEX notificacoes_pkey ON public.notificacoes USING btree (id);

CREATE UNIQUE INDEX sessoes_treino_pkey ON public.sessoes_treino USING btree (id);

alter table "public"."aluno_fichas" add constraint "aluno_fichas_pkey" PRIMARY KEY using index "aluno_fichas_pkey";

alter table "public"."alunos" add constraint "alunos_pkey" PRIMARY KEY using index "alunos_pkey";

alter table "public"."chat_camila" add constraint "chat_camila_pkey" PRIMARY KEY using index "chat_camila_pkey";

alter table "public"."evolucao" add constraint "evolucao_pkey" PRIMARY KEY using index "evolucao_pkey";

alter table "public"."exercicios" add constraint "exercicios_pkey" PRIMARY KEY using index "exercicios_pkey";

alter table "public"."faturas" add constraint "faturas_pkey" PRIMARY KEY using index "faturas_pkey";

alter table "public"."fichas_treino" add constraint "fichas_treino_pkey" PRIMARY KEY using index "fichas_treino_pkey";

alter table "public"."instrutores" add constraint "instrutores_pkey" PRIMARY KEY using index "instrutores_pkey";

alter table "public"."notificacoes" add constraint "notificacoes_pkey" PRIMARY KEY using index "notificacoes_pkey";

alter table "public"."sessoes_treino" add constraint "sessoes_treino_pkey" PRIMARY KEY using index "sessoes_treino_pkey";

alter table "public"."aluno_fichas" add constraint "aluno_fichas_aluno_id_fkey" FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE not valid;

alter table "public"."aluno_fichas" validate constraint "aluno_fichas_aluno_id_fkey";

alter table "public"."aluno_fichas" add constraint "aluno_fichas_ficha_id_fkey" FOREIGN KEY (ficha_id) REFERENCES public.fichas_treino(id) ON DELETE CASCADE not valid;

alter table "public"."aluno_fichas" validate constraint "aluno_fichas_ficha_id_fkey";

alter table "public"."alunos" add constraint "alunos_email_key" UNIQUE using index "alunos_email_key";

alter table "public"."alunos" add constraint "alunos_instrutor_id_fkey" FOREIGN KEY (instrutor_id) REFERENCES public.instrutores(id) not valid;

alter table "public"."alunos" validate constraint "alunos_instrutor_id_fkey";

alter table "public"."chat_camila" add constraint "chat_camila_aluno_id_fkey" FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE not valid;

alter table "public"."chat_camila" validate constraint "chat_camila_aluno_id_fkey";

alter table "public"."evolucao" add constraint "evolucao_aluno_id_fkey" FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE not valid;

alter table "public"."evolucao" validate constraint "evolucao_aluno_id_fkey";

alter table "public"."exercicios" add constraint "exercicios_ficha_id_fkey" FOREIGN KEY (ficha_id) REFERENCES public.fichas_treino(id) ON DELETE CASCADE not valid;

alter table "public"."exercicios" validate constraint "exercicios_ficha_id_fkey";

alter table "public"."faturas" add constraint "faturas_aluno_id_fkey" FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) not valid;

alter table "public"."faturas" validate constraint "faturas_aluno_id_fkey";

alter table "public"."faturas" add constraint "faturas_instrutor_id_fkey" FOREIGN KEY (instrutor_id) REFERENCES public.instrutores(id) not valid;

alter table "public"."faturas" validate constraint "faturas_instrutor_id_fkey";

alter table "public"."fichas_treino" add constraint "fichas_treino_instrutor_id_fkey" FOREIGN KEY (instrutor_id) REFERENCES public.instrutores(id) ON DELETE CASCADE not valid;

alter table "public"."fichas_treino" validate constraint "fichas_treino_instrutor_id_fkey";

alter table "public"."instrutores" add constraint "instrutores_codigo_convite_key" UNIQUE using index "instrutores_codigo_convite_key";

alter table "public"."instrutores" add constraint "instrutores_email_key" UNIQUE using index "instrutores_email_key";

alter table "public"."notificacoes" add constraint "notificacoes_aluno_id_fkey" FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE not valid;

alter table "public"."notificacoes" validate constraint "notificacoes_aluno_id_fkey";

alter table "public"."sessoes_treino" add constraint "sessoes_treino_aluno_id_fkey" FOREIGN KEY (aluno_id) REFERENCES public.alunos(id) ON DELETE CASCADE not valid;

alter table "public"."sessoes_treino" validate constraint "sessoes_treino_aluno_id_fkey";

alter table "public"."sessoes_treino" add constraint "sessoes_treino_ficha_id_fkey" FOREIGN KEY (ficha_id) REFERENCES public.fichas_treino(id) ON DELETE SET NULL not valid;

alter table "public"."sessoes_treino" validate constraint "sessoes_treino_ficha_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

grant delete on table "public"."aluno_fichas" to "anon";

grant insert on table "public"."aluno_fichas" to "anon";

grant references on table "public"."aluno_fichas" to "anon";

grant select on table "public"."aluno_fichas" to "anon";

grant trigger on table "public"."aluno_fichas" to "anon";

grant truncate on table "public"."aluno_fichas" to "anon";

grant update on table "public"."aluno_fichas" to "anon";

grant delete on table "public"."aluno_fichas" to "authenticated";

grant insert on table "public"."aluno_fichas" to "authenticated";

grant references on table "public"."aluno_fichas" to "authenticated";

grant select on table "public"."aluno_fichas" to "authenticated";

grant trigger on table "public"."aluno_fichas" to "authenticated";

grant truncate on table "public"."aluno_fichas" to "authenticated";

grant update on table "public"."aluno_fichas" to "authenticated";

grant delete on table "public"."aluno_fichas" to "service_role";

grant insert on table "public"."aluno_fichas" to "service_role";

grant references on table "public"."aluno_fichas" to "service_role";

grant select on table "public"."aluno_fichas" to "service_role";

grant trigger on table "public"."aluno_fichas" to "service_role";

grant truncate on table "public"."aluno_fichas" to "service_role";

grant update on table "public"."aluno_fichas" to "service_role";

grant delete on table "public"."alunos" to "anon";

grant insert on table "public"."alunos" to "anon";

grant references on table "public"."alunos" to "anon";

grant select on table "public"."alunos" to "anon";

grant trigger on table "public"."alunos" to "anon";

grant truncate on table "public"."alunos" to "anon";

grant update on table "public"."alunos" to "anon";

grant delete on table "public"."alunos" to "authenticated";

grant insert on table "public"."alunos" to "authenticated";

grant references on table "public"."alunos" to "authenticated";

grant select on table "public"."alunos" to "authenticated";

grant trigger on table "public"."alunos" to "authenticated";

grant truncate on table "public"."alunos" to "authenticated";

grant update on table "public"."alunos" to "authenticated";

grant delete on table "public"."alunos" to "service_role";

grant insert on table "public"."alunos" to "service_role";

grant references on table "public"."alunos" to "service_role";

grant select on table "public"."alunos" to "service_role";

grant trigger on table "public"."alunos" to "service_role";

grant truncate on table "public"."alunos" to "service_role";

grant update on table "public"."alunos" to "service_role";

grant delete on table "public"."chat_camila" to "anon";

grant insert on table "public"."chat_camila" to "anon";

grant references on table "public"."chat_camila" to "anon";

grant select on table "public"."chat_camila" to "anon";

grant trigger on table "public"."chat_camila" to "anon";

grant truncate on table "public"."chat_camila" to "anon";

grant update on table "public"."chat_camila" to "anon";

grant delete on table "public"."chat_camila" to "authenticated";

grant insert on table "public"."chat_camila" to "authenticated";

grant references on table "public"."chat_camila" to "authenticated";

grant select on table "public"."chat_camila" to "authenticated";

grant trigger on table "public"."chat_camila" to "authenticated";

grant truncate on table "public"."chat_camila" to "authenticated";

grant update on table "public"."chat_camila" to "authenticated";

grant delete on table "public"."chat_camila" to "service_role";

grant insert on table "public"."chat_camila" to "service_role";

grant references on table "public"."chat_camila" to "service_role";

grant select on table "public"."chat_camila" to "service_role";

grant trigger on table "public"."chat_camila" to "service_role";

grant truncate on table "public"."chat_camila" to "service_role";

grant update on table "public"."chat_camila" to "service_role";

grant delete on table "public"."evolucao" to "anon";

grant insert on table "public"."evolucao" to "anon";

grant references on table "public"."evolucao" to "anon";

grant select on table "public"."evolucao" to "anon";

grant trigger on table "public"."evolucao" to "anon";

grant truncate on table "public"."evolucao" to "anon";

grant update on table "public"."evolucao" to "anon";

grant delete on table "public"."evolucao" to "authenticated";

grant insert on table "public"."evolucao" to "authenticated";

grant references on table "public"."evolucao" to "authenticated";

grant select on table "public"."evolucao" to "authenticated";

grant trigger on table "public"."evolucao" to "authenticated";

grant truncate on table "public"."evolucao" to "authenticated";

grant update on table "public"."evolucao" to "authenticated";

grant delete on table "public"."evolucao" to "service_role";

grant insert on table "public"."evolucao" to "service_role";

grant references on table "public"."evolucao" to "service_role";

grant select on table "public"."evolucao" to "service_role";

grant trigger on table "public"."evolucao" to "service_role";

grant truncate on table "public"."evolucao" to "service_role";

grant update on table "public"."evolucao" to "service_role";

grant delete on table "public"."exercicios" to "anon";

grant insert on table "public"."exercicios" to "anon";

grant references on table "public"."exercicios" to "anon";

grant select on table "public"."exercicios" to "anon";

grant trigger on table "public"."exercicios" to "anon";

grant truncate on table "public"."exercicios" to "anon";

grant update on table "public"."exercicios" to "anon";

grant delete on table "public"."exercicios" to "authenticated";

grant insert on table "public"."exercicios" to "authenticated";

grant references on table "public"."exercicios" to "authenticated";

grant select on table "public"."exercicios" to "authenticated";

grant trigger on table "public"."exercicios" to "authenticated";

grant truncate on table "public"."exercicios" to "authenticated";

grant update on table "public"."exercicios" to "authenticated";

grant delete on table "public"."exercicios" to "service_role";

grant insert on table "public"."exercicios" to "service_role";

grant references on table "public"."exercicios" to "service_role";

grant select on table "public"."exercicios" to "service_role";

grant trigger on table "public"."exercicios" to "service_role";

grant truncate on table "public"."exercicios" to "service_role";

grant update on table "public"."exercicios" to "service_role";

grant delete on table "public"."faturas" to "anon";

grant insert on table "public"."faturas" to "anon";

grant references on table "public"."faturas" to "anon";

grant select on table "public"."faturas" to "anon";

grant trigger on table "public"."faturas" to "anon";

grant truncate on table "public"."faturas" to "anon";

grant update on table "public"."faturas" to "anon";

grant delete on table "public"."faturas" to "authenticated";

grant insert on table "public"."faturas" to "authenticated";

grant references on table "public"."faturas" to "authenticated";

grant select on table "public"."faturas" to "authenticated";

grant trigger on table "public"."faturas" to "authenticated";

grant truncate on table "public"."faturas" to "authenticated";

grant update on table "public"."faturas" to "authenticated";

grant delete on table "public"."faturas" to "service_role";

grant insert on table "public"."faturas" to "service_role";

grant references on table "public"."faturas" to "service_role";

grant select on table "public"."faturas" to "service_role";

grant trigger on table "public"."faturas" to "service_role";

grant truncate on table "public"."faturas" to "service_role";

grant update on table "public"."faturas" to "service_role";

grant delete on table "public"."fichas_treino" to "anon";

grant insert on table "public"."fichas_treino" to "anon";

grant references on table "public"."fichas_treino" to "anon";

grant select on table "public"."fichas_treino" to "anon";

grant trigger on table "public"."fichas_treino" to "anon";

grant truncate on table "public"."fichas_treino" to "anon";

grant update on table "public"."fichas_treino" to "anon";

grant delete on table "public"."fichas_treino" to "authenticated";

grant insert on table "public"."fichas_treino" to "authenticated";

grant references on table "public"."fichas_treino" to "authenticated";

grant select on table "public"."fichas_treino" to "authenticated";

grant trigger on table "public"."fichas_treino" to "authenticated";

grant truncate on table "public"."fichas_treino" to "authenticated";

grant update on table "public"."fichas_treino" to "authenticated";

grant delete on table "public"."fichas_treino" to "service_role";

grant insert on table "public"."fichas_treino" to "service_role";

grant references on table "public"."fichas_treino" to "service_role";

grant select on table "public"."fichas_treino" to "service_role";

grant trigger on table "public"."fichas_treino" to "service_role";

grant truncate on table "public"."fichas_treino" to "service_role";

grant update on table "public"."fichas_treino" to "service_role";

grant delete on table "public"."instrutores" to "anon";

grant insert on table "public"."instrutores" to "anon";

grant references on table "public"."instrutores" to "anon";

grant select on table "public"."instrutores" to "anon";

grant trigger on table "public"."instrutores" to "anon";

grant truncate on table "public"."instrutores" to "anon";

grant update on table "public"."instrutores" to "anon";

grant delete on table "public"."instrutores" to "authenticated";

grant insert on table "public"."instrutores" to "authenticated";

grant references on table "public"."instrutores" to "authenticated";

grant select on table "public"."instrutores" to "authenticated";

grant trigger on table "public"."instrutores" to "authenticated";

grant truncate on table "public"."instrutores" to "authenticated";

grant update on table "public"."instrutores" to "authenticated";

grant delete on table "public"."instrutores" to "service_role";

grant insert on table "public"."instrutores" to "service_role";

grant references on table "public"."instrutores" to "service_role";

grant select on table "public"."instrutores" to "service_role";

grant trigger on table "public"."instrutores" to "service_role";

grant truncate on table "public"."instrutores" to "service_role";

grant update on table "public"."instrutores" to "service_role";

grant delete on table "public"."notificacoes" to "anon";

grant insert on table "public"."notificacoes" to "anon";

grant references on table "public"."notificacoes" to "anon";

grant select on table "public"."notificacoes" to "anon";

grant trigger on table "public"."notificacoes" to "anon";

grant truncate on table "public"."notificacoes" to "anon";

grant update on table "public"."notificacoes" to "anon";

grant delete on table "public"."notificacoes" to "authenticated";

grant insert on table "public"."notificacoes" to "authenticated";

grant references on table "public"."notificacoes" to "authenticated";

grant select on table "public"."notificacoes" to "authenticated";

grant trigger on table "public"."notificacoes" to "authenticated";

grant truncate on table "public"."notificacoes" to "authenticated";

grant update on table "public"."notificacoes" to "authenticated";

grant delete on table "public"."notificacoes" to "service_role";

grant insert on table "public"."notificacoes" to "service_role";

grant references on table "public"."notificacoes" to "service_role";

grant select on table "public"."notificacoes" to "service_role";

grant trigger on table "public"."notificacoes" to "service_role";

grant truncate on table "public"."notificacoes" to "service_role";

grant update on table "public"."notificacoes" to "service_role";

grant delete on table "public"."sessoes_treino" to "anon";

grant insert on table "public"."sessoes_treino" to "anon";

grant references on table "public"."sessoes_treino" to "anon";

grant select on table "public"."sessoes_treino" to "anon";

grant trigger on table "public"."sessoes_treino" to "anon";

grant truncate on table "public"."sessoes_treino" to "anon";

grant update on table "public"."sessoes_treino" to "anon";

grant delete on table "public"."sessoes_treino" to "authenticated";

grant insert on table "public"."sessoes_treino" to "authenticated";

grant references on table "public"."sessoes_treino" to "authenticated";

grant select on table "public"."sessoes_treino" to "authenticated";

grant trigger on table "public"."sessoes_treino" to "authenticated";

grant truncate on table "public"."sessoes_treino" to "authenticated";

grant update on table "public"."sessoes_treino" to "authenticated";

grant delete on table "public"."sessoes_treino" to "service_role";

grant insert on table "public"."sessoes_treino" to "service_role";

grant references on table "public"."sessoes_treino" to "service_role";

grant select on table "public"."sessoes_treino" to "service_role";

grant trigger on table "public"."sessoes_treino" to "service_role";

grant truncate on table "public"."sessoes_treino" to "service_role";

grant update on table "public"."sessoes_treino" to "service_role";


