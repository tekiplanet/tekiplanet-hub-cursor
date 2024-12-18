import React, { useEffect, useState, useRef } from 'react';
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
import Pusher from 'pusher-js';

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
  unread_messages_count: number;
}

function QuoteDetails() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!quoteId) return;

    // Initialize Pusher
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      encrypted: true
    });

    // Subscribe to the quote channel
    const channel = pusher.subscribe(`quote.${quoteId}`);
    
    // Listen for new messages
    channel.bind('new-message', (data: { message: Quote['messages'][0] }) => {
      setQuote(prev => ({
        ...prev!,
        messages: [...prev!.messages, data.message]
      }));
      scrollToBottom();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [quoteId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [quote?.messages]);

  const markMessagesAsRead = async () => {
    try {
      await quoteService.markMessagesAsRead(quoteId!);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  useEffect(() => {
    if (quote?.unread_messages_count > 0) {
      markMessagesAsRead();
    }
  }, [quote?.unread_messages_count]);

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
          <TabsTrigger value="conversation" className="relative">
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversation
            {quote.unread_messages_count > 0 && (
              <div className="absolute -top-2 -right-2">
                <div className="relative flex items-center justify-center">
                  <span className="absolute h-3 w-3 rounded-full bg-destructive animate-ping-slow" />
                  <Badge 
                    variant="destructive" 
                    className="relative h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {quote.unread_messages_count}
                  </Badge>
                </div>
              </div>
            )}
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
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Conversation</h3>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {quote.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground text-sm">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 px-2">
                      {quote.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-start gap-2 ${
                            message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender_type === 'admin' && (
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  SA
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div
                            className={`group relative max-w-[80%] rounded-2xl px-4 py-2 ${
                              message.sender_type === 'user'
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-muted rounded-tl-none'
                            }`}
                          >
                            {message.sender_type === 'admin' && (
                              <p className="text-xs font-medium mb-1 text-muted-foreground">
                                Support Agent
                              </p>
                            )}
                            <p className="text-sm">{message.message}</p>
                            <span 
                              className={`text-[10px] mt-1 opacity-0 group-hover:opacity-70 transition-opacity ${
                                message.sender_type === 'user' 
                                  ? 'text-primary-foreground' 
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {format(new Date(message.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>

                          {message.sender_type === 'user' && (
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-xs font-medium text-primary-foreground">
                                  {message.user.first_name.charAt(0)}
                                  {message.user.last_name.charAt(0)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="relative mt-auto">
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
                    className="pr-12 py-6 rounded-full border-muted-foreground/20"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-8 w-8"
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
