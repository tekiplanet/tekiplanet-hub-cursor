import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { quoteService } from '@/services/quoteService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, FileText, MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'react-hot-toast';

interface Quote {
  id: string;
  service: {
    name: string;
  };
  industry: string;
  budget_range: string;
  contact_method: string;
  project_description: string;
  project_deadline: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  messages: Array<{
    id: string;
    message: string;
    sender_type: 'user' | 'admin';
    created_at: string;
    user: {
      first_name: string;
      last_name: string;
      avatar: string;
    };
  }>;
}

function QuoteDetails() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      try {
        const data = await quoteService.getQuoteDetails(quoteId);
        setQuote(data.quote);
      } catch (error) {
        console.error('Failed to fetch quote details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      fetchQuoteDetails();
    }
  }, [quoteId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const response = await quoteService.sendMessage(quoteId!, newMessage);
      if (response.success) {
        setQuote(prev => ({
          ...prev!,
          messages: [...prev!.messages, response.message]
        }));
        setNewMessage('');
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quote) {
    return <div>Quote not found</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{quote.service.name}</h1>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(quote.status)}>
            {quote.status.toUpperCase()}
          </Badge>
          <span className="text-muted-foreground">
            Submitted on {format(new Date(quote.created_at), 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">
            <Info className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="description">
            <FileText className="h-4 w-4 mr-2" />
            Description
          </TabsTrigger>
          <TabsTrigger value="conversation">
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Industry</h3>
                  <p>{quote.industry}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Budget Range</h3>
                  <p>{quote.budget_range}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Contact Method</h3>
                  <p>{quote.contact_method}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Project Deadline</h3>
                  <p>{format(new Date(quote.project_deadline), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="description">
          <Card>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap">{quote.project_description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversation">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {quote.messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet. Start the conversation!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {quote.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender_type === 'user'
                                ? 'bg-primary text-primary-foreground ml-4'
                                : 'bg-muted mr-4'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {message.user.first_name} {message.user.last_name}
                              </span>
                            </div>
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {format(new Date(message.created_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'reviewed':
      return 'outline';
    case 'accepted':
      return 'success';
    case 'rejected':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default QuoteDetails;
