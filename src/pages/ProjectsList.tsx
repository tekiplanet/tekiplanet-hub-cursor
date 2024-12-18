import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  PlusCircle,
  Server,
  CheckCircle,
  Clock
} from 'lucide-react';
import PagePreloader from '@/components/ui/PagePreloader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { projectService, type Project } from '@/services/projectService';
import { toast } from 'sonner';
import { EmptyPlaceholder } from "@/components/empty-placeholder"

export default function ProjectsListPage() {
  return (
    // <Dashboard>
      <ProjectsList />
    // </Dashboard>
  );
}

function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects();
        if (data.success) {
          setProjects(data.projects);
          setFilteredProjects(data.projects);
        } else if (data.message === 'Business profile not found') {
          setProjects([]);
          setFilteredProjects([]);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          toast.error('Failed to fetch projects');
          console.error(error);
        }
        setProjects([]);
        setFilteredProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let result = projects;

    if (searchTerm) {
      result = result.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      result = result.filter(project => project.status === filterStatus);
    }

    setFilteredProjects(result);
  }, [searchTerm, filterStatus, projects]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <PagePreloader />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-4 md:p-6 bg-background"
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/dashboard/projects/new')}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex space-x-2 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterStatus(null)}>
              All Statuses
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('Pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('In Progress')}>
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus('Completed')}>
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredProjects.length === 0 ? (
          <EmptyPlaceholder className="mx-auto max-w-[420px] mt-16">
            <EmptyPlaceholder.Icon>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
            </EmptyPlaceholder.Icon>
            <EmptyPlaceholder.Title>No projects found</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              {projects.length === 0 
                ? "You haven't created any projects yet. Get started by creating your first project."
                : "No projects match your search criteria. Try adjusting your filters."}
            </EmptyPlaceholder.Description>
            {projects.length === 0 && (
              <Button 
                onClick={() => navigate('/dashboard/services')}
                className="mt-4"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Start New Project
              </Button>
            )}
          </EmptyPlaceholder>
        ) : (
          filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader 
                className="flex flex-row items-center justify-between space-y-0 p-4 pb-0"
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-lg leading-none tracking-tight">
                    {project.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {project.client_name}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(project.status)} text-xs`}
                >
                  {project.status}
                </Badge>
              </CardHeader>
              <CardContent 
                className="p-4 pt-2 cursor-pointer"
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Server className="h-4 w-4" />
                    <span>{project.start_date} - {project.end_date}</span>
                  </div>
                  <span className="font-bold text-primary">{project.budget}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full ${
                      project.status === 'Completed' 
                        ? 'bg-green-500' 
                        : project.status === 'In Progress' 
                        ? 'bg-yellow-500' 
                        : 'bg-blue-500'
                    }`} 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
