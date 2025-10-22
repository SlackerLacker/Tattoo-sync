create or replace function create_client_with_profile(
    p_full_name text,
    p_email text,
    p_phone text,
    p_studio_id uuid
)
returns table (
    id uuid,
    full_name text,
    email text,
    phone text,
    studio_id uuid,
    created_at timestamptz
)
language plpgsql
security definer
as $$
declare
    new_profile_id uuid;
begin
    -- Insert into profiles and get the new id
    insert into public.profiles (full_name, email, phone, studio_id, role)
    values (p_full_name, p_email, p_phone, p_studio_id, 'client')
    returning public.profiles.id into new_profile_id;

    -- Insert into clients using the new profile id
    insert into public.clients (id, full_name, email, phone, studio_id)
    values (new_profile_id, p_full_name, p_email, p_phone, p_studio_id);

    -- Return the newly created client's data
    return query
    select c.id, c.full_name, c.email, c.phone, c.studio_id, c.created_at
    from public.clients c
    where c.id = new_profile_id;
end;
$$;