import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { projectService, type ProjectDetail } from '@/services/projectService';
import { toast } from 'sonner';
import PagePreloader from '@/components/ui/PagePreloader';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MoreVertical, 
  FileText, 
  Server, 
  CheckCircle, 
  Clock, 
  Users, 
  FileUp, 
  CreditCard,
  Download,
  Wallet,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ProjectDetailsPage() {
  return (
    // <Dashboard>
      <ProjectDetails />
    // </Dashboard>
  );
}

function ProjectDetails() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('Full location:', location);
  console.log('All params:', useParams());

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        if (!projectId) {
          console.log('No projectId provided in params');
          navigate('/dashboard/projects');
          return;
        }

        console.log('Attempting to fetch project with ID:', projectId);
        const data = await projectService.getProject(projectId);
        console.log('Project data:', data);
        
        if (data.success) {
          setProject(data.project);
        } else {
          console.log('Project fetch failed:', data.message);
          toast.error(data.message || 'Failed to fetch project details');
          navigate('/dashboard/projects');
        }
      } catch (error: any) {
        console.error('Error fetching project:', error.response?.data || error);
        toast.error(error.response?.data?.message || 'Failed to fetch project details');
        navigate('/dashboard/projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId, navigate]);

  if (isLoading) {
    return <PagePreloader />;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full bg-background"
      >
        <header className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold">{project.name}</h1>
              <Badge 
                variant="outline" 
                className={`${getStatusColor(project.status)} text-xs`}
              >
                {project.status}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Close Project</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <Tabs 
          value="overview" 
          className="flex-grow overflow-y-auto"
        >
          <TabsList className="sticky top-0 z-10 bg-muted/50 border-b grid grid-cols-5 gap-1 px-1 py-1 h-auto rounded-none">
            <TabsTrigger 
              value="overview" 
              className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="stages" 
              className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
            >
              Stages
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
            >
              Team
            </TabsTrigger>
            <TabsTrigger 
              value="files" 
              className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
            >
              Files
            </TabsTrigger>
            <TabsTrigger 
              value="invoices" 
              className="text-xs px-2 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm transition-colors"
            >
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <span>Business: {project.business_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Duration: {project.start_date} - {project.end_date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <span>Budget: {project.budget}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(project.status)}`} 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{project.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stages" className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">Project Stages</h2>
            {project.stages.map((stage, index) => (
              <motion.div 
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-grow">
                  <h3 className="font-medium">{stage.name}</h3>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                  <span className="text-sm text-muted-foreground">
                    {stage.start_date} - {stage.end_date || 'Ongoing'}
                  </span>
                </div>
                <Badge variant="outline" className={getStatusColor(stage.status)}>
                  {stage.status}
                </Badge>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="team" className="p-4 space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Users className="mr-2 h-5 w-5" /> Project Team
            </h2>
            {project.team_members.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg"
              >
                {member.user.avatar && (
                  <img 
                    src={member.user.avatar} 
                    alt={member.user.name} 
                    className="h-10 w-10 rounded-full object-cover" 
                  />
                )}
                <div className="flex-grow">
                  <h3 className="font-medium">{member.user.name}</h3>
                  <span className="text-sm text-muted-foreground">{member.role}</span>
                </div>
                <Badge variant="outline">{member.status}</Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="files" className="p-4 space-y-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FileUp className="mr-2 h-5 w-5" /> Project Files
            </h2>
            {project.files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{file.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {file.file_size} • {file.file_type}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="invoices" className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.invoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="border rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4"
                    >
                      <div className="flex-grow w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-2">
                          <h3 className="font-semibold text-sm sm:text-base flex-grow">
                            Invoice #{invoice.invoice_number}
                          </h3>
                          <Badge variant="outline" className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-bold">{invoice.amount}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due Date:</span>
                            <p>{invoice.due_date}</p>
                          </div>
                          {invoice.paid_at && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Paid Date:</span>
                              <p>{invoice.paid_at}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch(status.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'pending': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getProgressColor(status: string) {
  switch(status.toLowerCase()) {
    case 'completed': return 'bg-green-500';
    case 'in_progress': return 'bg-yellow-500';
    default: return 'bg-blue-500';
  }
}
