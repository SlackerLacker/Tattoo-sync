-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE public.appointments
DROP CONSTRAINT fk_appointments_client;

-- Step 2: Add the correct foreign key constraint
ALTER TABLE public.appointments
ADD CONSTRAINT fk_appointments_client
FOREIGN KEY (client_id)
REFERENCES public.clients (id)
ON DELETE CASCADE;
