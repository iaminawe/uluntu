-- supabase/migrations/20250523215336_create_moddatetime_function.sql
CREATE OR REPLACE FUNCTION public.moddatetime() -- No (column_name TEXT) here
RETURNS TRIGGER AS $$
BEGIN
    -- Check if an argument (the column name) was passed
    IF TG_NARGS = 0 THEN
        RAISE EXCEPTION 'Column name argument is required for moddatetime function. Usage: EXECUTE FUNCTION moddatetime(''your_column_name'');';
    END IF;

    -- TG_ARGV[0] will contain the first argument passed in EXECUTE FUNCTION (e.g., 'updated_at')
    -- Use format() with %I to safely quote the identifier (column name)
    EXECUTE format('NEW.%I = NOW()', TG_ARGV[0]);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.moddatetime() IS 'Generic trigger function to set a specified column (passed as an argument, e.g., ''updated_at'') to the current timestamp whenever a row is updated.';
