CREATE SCHEMA IF NOT EXISTS private;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Function to create a test user and return their ID.
-- WARNING: This is for seeding/testing ONLY. Do NOT expose this directly via API.
CREATE OR REPLACE FUNCTION private.create_test_user(
  email_address TEXT,
  user_password TEXT DEFAULT 'password123'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, 
    recovery_token, recovery_sent_at, email_change_token_new, email_change, 
    email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, 
    is_sso_user, created_at, updated_at, phone, phone_confirmed_at, 
    phone_change, phone_change_sent_at, email_change_token_current, 
    email_change_confirm_status, banned_until, reauthentication_token, 
    reauthentication_sent_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000', -- instance_id
    gen_random_uuid(), -- id
    'authenticated', -- aud
    'authenticated', -- role
    email_address, -- email
    extensions.crypt(user_password, extensions.gen_salt('bf')), -- encrypted_password
    now(), -- email_confirmed_at
    NULL, -- invited_at
    NULL, -- confirmation_token
    NULL, -- confirmation_sent_at
    NULL, -- recovery_token
    NULL, -- recovery_sent_at
    NULL, -- email_change_token_new
    '',   -- email_change
    NULL, -- email_change_sent_at
    NULL, -- last_sign_in_at
    '{"provider":"email","providers":["email"]}', -- raw_app_meta_data
    '{}', -- raw_user_meta_data
    false, -- is_sso_user
    now(), -- created_at
    now(), -- updated_at
    NULL, -- phone
    NULL, -- phone_confirmed_at
    '',   -- phone_change
    NULL, -- phone_change_sent_at
    '',   -- email_change_token_current
    0,    -- email_change_confirm_status
    NULL, -- banned_until
    '',   -- reauthentication_token
    NULL  -- reauthentication_sent_at
  ) RETURNING id INTO new_user_id;

  RETURN new_user_id;
END;
$$;

-- Function to assign a role to a user.
CREATE OR REPLACE FUNCTION private.assign_role_to_user(
  user_id_to_assign uuid,
  role_to_assign public.app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (user_id_to_assign, role_to_assign)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Grant execute on these functions to postgres role (which runs seeds)
GRANT EXECUTE ON FUNCTION private.create_test_user(TEXT, TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION private.assign_role_to_user(uuid, public.app_role) TO postgres;
