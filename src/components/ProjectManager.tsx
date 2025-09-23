import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Users, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  sprints: Sprint[];
  project_members: { user_id: string; role: string }[];
}

interface Sprint {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  goal: string;
  is_active: boolean;
  project_id: string;
}

interface ProjectFormData {
  name: string;
  description: string;
}

interface SprintFormData {
  name: string;
  start_date: string;
  end_date: string;
  goal: string;
}

export function ProjectManager() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('projects')
        .select(`
          *,
          project_members (user_id, role),
          sprints (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: ProjectFormData) => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('projects')
        .insert([{
          name: projectData.name,
          description: projectData.description,
          owner_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as project member
      if (data) {
        await (supabase as any).from('project_members').insert([{
          project_id: data.id,
          user_id: user.id,
          role: 'owner'
        }]);
      }
      
      fetchProjects();
      setShowCreateProject(false);
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          Projects & Sprints
        </h2>
        <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
          <DialogTrigger asChild>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSubmit={createProject} onCancel={() => setShowCreateProject(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to start planning poker sessions
            </p>
            <Button onClick={() => setShowCreateProject(true)} className="gradient-primary">
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onUpdate={fetchProjects}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onUpdate }: { project: Project; onUpdate: () => void }) {
  const [showCreateSprint, setShowCreateSprint] = useState(false);

  const createSprint = async (sprintData: SprintFormData) => {
    try {
      const { error } = await (supabase as any)
        .from('sprints')
        .insert([{
          ...sprintData,
          project_id: project.id
        }]);

      if (error) throw error;

      onUpdate();
      setShowCreateSprint(false);
      toast({
        title: "Success",
        description: "Sprint created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sprint",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="gradient-primary bg-clip-text text-transparent">{project.name}</span>
          <Badge variant="secondary">
            <Users className="w-3 h-3 mr-1" />
            {project.project_members.length}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Sprints</h4>
            <Dialog open={showCreateSprint} onOpenChange={setShowCreateSprint}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-3 h-3 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Sprint</DialogTitle>
                </DialogHeader>
                <SprintForm onSubmit={createSprint} onCancel={() => setShowCreateSprint(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          {project.sprints?.length === 0 ? (
            <p className="text-xs text-muted-foreground">No sprints yet</p>
          ) : (
            <div className="space-y-2">
              {project.sprints?.map(sprint => (
                <div key={sprint.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                  <div>
                    <span className="font-medium">{sprint.name}</span>
                    {sprint.is_active && (
                      <Badge variant="default" className="ml-2 text-xs">Active</Badge>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(sprint.start_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectForm({ onSubmit, onCancel }: { 
  onSubmit: (data: ProjectFormData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="gradient-primary">
          Create Project
        </Button>
      </div>
    </form>
  );
}

function SprintForm({ onSubmit, onCancel }: { 
  onSubmit: (data: SprintFormData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState<SprintFormData>({
    name: '',
    start_date: '',
    end_date: '',
    goal: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="sprint-name">Sprint Name</Label>
        <Input
          id="sprint-name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="goal">Sprint Goal</Label>
        <Textarea
          id="goal"
          value={formData.goal}
          onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
          rows={2}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="gradient-primary">
          Create Sprint
        </Button>
      </div>
    </form>
  );
}