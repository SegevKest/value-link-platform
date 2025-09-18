-- Fix search path for cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_deleted_contracts()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete contracts that have been soft-deleted for more than 30 days
    DELETE FROM public.contract 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;