
CREATE OR REPLACE FUNCTION pd_create_collection(coll_name text, schema_name text = 'collections')
RETURNS BOOLEAN AS $$
BEGIN
PERFORM pd_create_schema(schema_name);
IF NOT (SELECT pd_collection_exists(coll_name, schema_name))
THEN
  EXECUTE format('
  CREATE TABLE IF NOT EXISTS %I.%I (
    id serial PRIMARY KEY NOT NULL,
    body jsonb NOT NULL DEFAULT ''{}''::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE TRIGGER tg_update
  BEFORE INSERT OR UPDATE
  ON %1$I.%2$I
  FOR EACH ROW
  EXECUTE PROCEDURE pd_update();
  ', schema_name, coll_name);
  RETURN true;
ELSE
  RETURN false;
END IF;
END
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION pd_collection_exists(coll_name text, schema_name text = 'collections')
RETURNS boolean AS $$
BEGIN
RETURN EXISTS(
  SELECT 1 FROM information_schema.tables WHERE table_schema = format('%s', schema_name) AND table_name = format('%s', coll_name)
);
END
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION pd_schema_exists(schema_name text = 'collections')
RETURNS BOOLEAN AS $$
BEGIN
	RETURN EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = format('%s', schema_name));
END
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION pd_create_schema(schema_name text = 'collections')
RETURNS BOOLEAN AS $$
BEGIN
IF NOT pd_schema_exists(schema_name)
THEN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I;', schema_name);
  RETURN true;
ELSE
  RETURN false;
END IF;
END
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION pd_drop_collection(coll_name text, schema_name text = 'collections')
RETURNS BOOLEAN AS $$
BEGIN
IF (SELECT pd_collection_exists(coll_name, schema_name))
THEN
  EXECUTE format('DROP TABLE %I.%I CASCADE;', schema_name, coll_name);
  RETURN true;
ELSE
  RETURN false;
END IF;
END
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION pd_truncate_collection(coll_name text, schema_name text = 'collections')
RETURNS BOOLEAN AS $$
BEGIN
IF (SELECT pd_collection_exists(coll_name, schema_name))
THEN
  EXECUTE format('TRUNCATE TABLE %I.%I;', schema_name, coll_name);
  RETURN true;
ELSE
  RETURN false;
END IF;
END
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION pd_list_collections(schema_name text = 'collections')
RETURNS table(collection_name text) AS $$
BEGIN
RETURN QUERY SELECT table_name::text FROM information_schema.columns
             WHERE table_schema = format('%s', schema_name) AND column_name = 'body' AND data_type = 'jsonb';
END
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION pd_update()
RETURNS trigger AS $$
BEGIN
NEW.body := (SELECT jsonb_set(NEW.body, ARRAY['id'], to_jsonb(NEW.id)));
NEW.updated_at := now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE


-- INSERT INTO collections.my_doc (body) VALUES ('{"dsaf":123}')
--   ON CONFLICT ON CONSTRAINT mydoc_pkey DO UPDATE
--   SET body = EXCLUDED.body;

-- CREATE FUNCTION jsonb_merge(JSONB, JSONB)
-- RETURNS JSONB AS $$
-- WITH json_union AS (
--     SELECT * FROM JSONB_EACH($1)
--     UNION ALL
--     SELECT * FROM JSONB_EACH($2)
-- ) SELECT JSON_OBJECT_AGG(key, value)::JSONB
--      FROM json_union
--      WHERE key NOT IN (SELECT key FROM json_union WHERE value ='null');
-- $$ LANGUAGE SQL;
