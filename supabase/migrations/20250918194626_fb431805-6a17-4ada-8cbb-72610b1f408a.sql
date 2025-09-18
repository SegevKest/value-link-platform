-- Add soft delete functionality to contracts
-- Add deleted_at column for soft delete functionality
ALTER TABLE public.contract ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on deleted_at queries
CREATE INDEX idx_contract_deleted_at ON public.contract(deleted_at);

-- Create function to permanently delete contracts older than 30 days
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
$$ LANGUAGE plpgsql SECURITY DEFINER;