-- Add missing content column to transcriptions table
-- This will store the full processed results (BiographyContent, tasks, etc.)

ALTER TABLE public.transcriptions 
ADD COLUMN IF NOT EXISTS content jsonb;

-- Add a comment to document what this column stores
COMMENT ON COLUMN public.transcriptions.content IS 'Stores the full processed content including results, BiographyContent, script content, etc.'; 