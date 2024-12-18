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
  DollarSign,
  PencilIcon,
  Trash2Icon,
  PlusCircle,
  Circle,
  Calendar,
  Timer,
  FolderPlus,
  Upload,
  Share2,
  Layout,
  ListTodo,
  File,
  FileSpreadsheet,
  Image,
  XCircle,
  Loader2,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api-client';

// Helper functions
function getFileIcon(fileType: string) {
  switch(fileType.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-6 w-6 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="h-6 w-6 text-blue-500" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <Image className="h-6 w-6 text-purple-500" />;
    default:
      return <File className="h-6 w-6 text-gray-500" />;
  }
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

function formatCurrency(amount: string | number) {
  const numericAmount = typeof amount === 'string' ? 
    parseFloat(amount.replace(/[^0-9.-]+/g, "")) : 
    amount;
    
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(numericAmount);
}

// Components
export default function ProjectDetailsPage() {
  return <ProjectDetails />;
}

function ProjectDetails() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ProjectInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthStore();
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

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

  // Add this function to handle PDF download
  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
        setIsDownloading(invoiceId);
        
        const response = await axios({
            url: `${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/download`,
            method: 'GET',
            responseType: 'blob', // Important for handling PDF
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/pdf'
            }
        });

        // Create blob from response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice_${invoiceId}.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        
        toast.success('Invoice downloaded successfully');
    } catch (error: any) {
        console.error('Download error:', error);
        toast.error(error.response?.data?.message || 'Failed to download invoice');
    } finally {
        setIsDownloading(null);
    }
  };

  const handlePayment = async (invoice: ProjectInvoice) => {
    try {
      setIsProcessing(true);
      const response = await apiClient.post(`/invoices/${invoice.id}/process-payment`);
      
      if (response.data.success) {
        toast.success('Payment processed successfully');
        // Update the project data to reflect the new invoice status
        const updatedProject = await projectService.getProject(projectId!);
        setProject(updatedProject.project);
        
        // Update user's wallet balance in auth store
        if (user) {
          useAuthStore.setState({
            user: {
              ...user,
              wallet_balance: response.data.wallet_balance
            }
          });
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to process payment');
      }
    } finally {
      setIsProcessing(false);
      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
    }
  };

  // Add this function to handle receipt viewing
  const handleViewReceipt = async (invoiceId: string) => {
    try {
      setIsLoadingReceipt(true);
      const response = await apiClient.get(`/invoices/${invoiceId}/receipt`);
      
      if (response.data.success) {
        setReceiptData(response.data.data);
        setIsReceiptModalOpen(true);
      }
    } catch (error: any) {
      console.error('Receipt error:', error);
      toast.error(error.response?.data?.message || 'Failed to load receipt');
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  // Add this function to handle receipt download
  const handleDownloadReceipt = async (invoiceId: string) => {
    try {
      setIsDownloadingReceipt(true);
      const response = await axios({
        url: `${import.meta.env.VITE_API_URL}/invoices/${invoiceId}/receipt/download`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/pdf'
        }
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt_${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt');
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  return (
    <div className="container mx-auto p-0 sm:p-4 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col min-h-[calc(100vh-4rem)] bg-background"
      >
        <header className="sticky top-0 z-20 bg-gradient-to-r from-background to-background/80 backdrop-blur-lg border-b">
          <div className="p-4 flex flex-col space-y-2">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(project.status)} rounded-full`}
                >
                  {project.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {project.business_name}
                </span>
              </div>
            </div>
          </div>
        </header>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="flex-1"
        >
          <TabsList className="w-full justify-start px-4 h-12 bg-transparent border-b rounded-none overflow-x-auto flex-nowrap hide-scrollbar">
            {[
              { value: "overview", label: "Overview", icon: <Layout className="h-4 w-4" /> },
              { value: "stages", label: "Stages", icon: <ListTodo className="h-4 w-4" /> },
              { value: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
              { value: "files", label: "Files", icon: <FileText className="h-4 w-4" /> },
              { value: "invoices", label: "Invoices", icon: <CreditCard className="h-4 w-4" /> },
            ].map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 flex items-center gap-2 min-w-fit"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="p-4 space-y-6 m-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="text-lg font-semibold">{project.budget}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Timeline</p>
                        <p className="text-lg font-semibold">{project.progress}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Server className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Business</p>
                        <p className="text-lg font-semibold">{project.business_name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <CheckCircle className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Completion</p>
                        <p className="text-lg font-semibold">{project.progress}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all ${getProgressColor(project.status)}`} 
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stages" className="m-0 p-4 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Project Stages</h2>
              </div>
              
              <div className="relative">
                {project.stages.map((stage, index) => (
                  <motion.div 
                    key={stage.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start mb-8 relative">
                      {/* Timeline Line */}
                      {index !== project.stages.length - 1 && (
                        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-border" />
                      )}
                      
                      {/* Stage Content */}
                      <div className="flex-1 ml-12">
                        <Card className="relative hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="absolute -left-12 top-4 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {stage.status === 'completed' ? (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              ) : (
                                <Circle className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base">{stage.name}</CardTitle>
                                <CardDescription>{stage.description}</CardDescription>
                              </div>
                              <Badge variant="outline" className={getStatusColor(stage.status)}>
                                {stage.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                Start: {stage.start_date}
                              </div>
                              <div className="flex items-center">
                                <Timer className="h-4 w-4 mr-1" />
                                End: {stage.end_date || 'Ongoing'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="team" className="m-0 p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {project.team_members.map((member) => (
                  <Card key={member.id} className="bg-card hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        {member.user.avatar ? (
                          <img 
                            src={member.user.avatar} 
                            alt={member.user.name} 
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-background" 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold ring-2 ring-background">
                            {member.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{member.user.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="files" className="p-4 space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.files.map((file) => (
                  <Card 
                    key={file.id} 
                    className="hover:shadow-md transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getFileIcon(file.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{file.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {file.file_size}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {file.file_type}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => window.open(file.file_path, '_blank')}
                        >
                          <Download className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="p-4 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Project Invoices</h2>
              </div>

              <div className="grid gap-4">
                {project.invoices.map((invoice) => (
                  <Card 
                    key={invoice.id} 
                    className="hover:shadow-md transition-all"
                  >
                    <CardContent className="p-4">
                      {/* Invoice Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-full shrink-0">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">
                            Invoice #{invoice.invoice_number}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline" className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            {invoice.status === 'pending' && (
                              <span className="text-sm text-destructive font-medium">
                                Due: {invoice.due_date}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Invoice Amount */}
                      <div className="mt-3 flex items-center justify-between border-t pt-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-bold text-lg">{invoice.amount}</p>
                        </div>
                        <div className="flex gap-2">
                          {invoice.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="shrink-0"
                                disabled={isDownloading === invoice.id}
                                onClick={() => {
                                  console.log('Full invoice object:', invoice);
                                  console.log('Invoice ID:', invoice.id);
                                  console.log('Invoice ID type:', typeof invoice.id);
                                  
                                  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                                  const isValidUUID = uuidRegex.test(String(invoice.id));
                                  console.log('Is valid UUID?', isValidUUID);

                                  if (!isValidUUID) {
                                    toast.error('Invalid invoice ID format');
                                    return;
                                  }
                                  handleDownloadInvoice(String(invoice.id));
                                }}
                              >
                                {isDownloading === invoice.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                  <Download className="h-4 w-4 text-muted-foreground" />
                                )}
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="shrink-0"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setIsPaymentModalOpen(true);
                                }}
                              >
                                <DollarSign className="h-4 w-4 mr-2" />
                                Pay Now
                              </Button>
                            </>
                          )}
                          {invoice.status === 'paid' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="shrink-0"
                              onClick={() => handleViewReceipt(invoice.id)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Paid Status */}
                      {invoice.status === 'paid' && invoice.paid_at && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="truncate">Paid on {invoice.paid_at}</span>
                          </div>
                        </div>
                      )}

                      {/* Cancelled Status */}
                      {invoice.status === 'cancelled' && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm text-destructive">
                            <XCircle className="h-4 w-4" />
                            <span className="truncate">Invoice cancelled</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>

      {/* Payment Confirmation Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </span>
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-left">
              Review the payment details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Invoice Details */}
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Invoice Number:</span>
                  <span className="font-medium">#{selectedInvoice?.invoice_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Amount:</span>
                  <span className="text-lg font-semibold text-primary">
                    {selectedInvoice?.amount && formatCurrency(selectedInvoice.amount)}
                  </span>
                </div>
              </div>

              {/* Wallet Section */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Wallet Balance:</span>
                  <span className="font-medium">{formatCurrency(user?.wallet_balance || 0)}</span>
                </div>
                
                {selectedInvoice && user?.wallet_balance < parseFloat(selectedInvoice.amount.replace(/[^0-9.-]+/g, "")) && (
                  <div className="flex items-start gap-2 bg-destructive/10 text-destructive p-3 rounded-md">
                    <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Insufficient Balance</p>
                      <p className="text-destructive/80 mt-1">
                        Please fund your wallet with at least {
                          formatCurrency(
                            parseFloat(selectedInvoice.amount.replace(/[^0-9.-]+/g, "")) - (user?.wallet_balance || 0)
                          )
                        } to complete this payment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setIsPaymentModalOpen(false);
                setSelectedInvoice(null);
              }}
            >
              Cancel
            </Button>
            
            {selectedInvoice && user?.wallet_balance < parseFloat(selectedInvoice.amount.replace(/[^0-9.-]+/g, "")) ? (
              <Button
                variant="default"
                className="gap-2"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  navigate('/dashboard/wallet');
                }}
              >
                <Wallet className="h-4 w-4" />
                Fund Wallet
              </Button>
            ) : (
              <Button
                variant="default"
                disabled={isProcessing}
                onClick={() => selectedInvoice && handlePayment(selectedInvoice)}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirm Payment
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </span>
              Payment Receipt
            </DialogTitle>
            <DialogDescription className="text-left">
              Receipt #{receiptData?.receipt_details.receipt_number}
            </DialogDescription>
          </DialogHeader>

          {isLoadingReceipt ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <div className="space-y-4">
                  {/* Payment Details */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Invoice Number:</div>
                      <div className="font-medium">#{receiptData?.invoice.invoice_number}</div>
                      <div className="text-muted-foreground">Payment Date:</div>
                      <div className="font-medium">
                        {receiptData?.receipt_details.payment_date && 
                          new Date(receiptData.receipt_details.payment_date).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">Payment Method:</div>
                      <div className="font-medium capitalize">{receiptData?.receipt_details.payment_method}</div>
                      <div className="text-muted-foreground">Transaction Ref:</div>
                      <div className="font-medium">{receiptData?.receipt_details.transaction_ref}</div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold">Project Details</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Project:</div>
                      <div className="font-medium">{receiptData?.invoice.project.name}</div>
                      <div className="text-muted-foreground">Client:</div>
                      <div className="font-medium">{receiptData?.invoice.project.business_profile.business_name}</div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold">Amount Paid</h3>
                    <div className="text-2xl font-bold text-primary">
                      {receiptData?.invoice.amount && formatCurrency(receiptData.invoice.amount)}
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      Payment Successful
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsReceiptModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => handleDownloadReceipt(receiptData.invoice.id)}
                  className="gap-2"
                  disabled={isDownloadingReceipt}
                >
                  {isDownloadingReceipt ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download Receipt
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
