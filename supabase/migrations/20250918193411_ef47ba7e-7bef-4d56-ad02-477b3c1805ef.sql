-- Migration to assign orphaned contracts to users
-- This will assign all contracts without user_id to the first authenticated user
-- Or you can manually specify a user UUID if you know which user should own these contracts

-- First, let's create a function to get the first user ID (you can modify this if needed)
DO $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user from auth.users
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    -- If we found a user, update all orphaned records
    IF first_user_id IS NOT NULL THEN
        -- Update contracts
        UPDATE public.contract 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
        
        -- Update contract_terms
        UPDATE public.contract_terms 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
        
        -- Update assets
        UPDATE public.asset 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
        
        -- Update tenants
        UPDATE public.tenant 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
        
        -- Update property owners
        UPDATE public.propertyowner 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
        
        -- Update contacts
        UPDATE public.contact 
        SET user_id = first_user_id 
        WHERE user_id IS NULL;
        
        RAISE NOTICE 'Successfully migrated orphaned records to user: %', first_user_id;
    ELSE
        RAISE NOTICE 'No users found. Please create a user account first.';
    END IF;
END $$;