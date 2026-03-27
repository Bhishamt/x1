-- Add targeting columns to announcements for HOD and Class Incharge permissions
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS target_department TEXT,
ADD COLUMN IF NOT EXISTS target_semester SMALLINT;

-- Update RLS or basic tracking (Assuming RLS will use these columns)
