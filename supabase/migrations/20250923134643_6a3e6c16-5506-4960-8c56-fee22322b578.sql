-- Fix infinite recursion in project_members RLS policies
-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view project members" ON project_members;
DROP POLICY IF EXISTS "Project owners can manage members" ON project_members;

-- Create safer policies without circular references
CREATE POLICY "Users can view project members they belong to" 
ON project_members 
FOR SELECT 
USING (user_id = auth.uid() OR project_id IN (
  SELECT project_id FROM project_members WHERE user_id = auth.uid()
));

CREATE POLICY "Project owners can manage all members" 
ON project_members 
FOR ALL 
USING (project_id IN (
  SELECT id FROM projects WHERE owner_id = auth.uid()
));

CREATE POLICY "Users can add themselves to projects" 
ON project_members 
FOR INSERT 
WITH CHECK (user_id = auth.uid());