import React, { useRef, useEffect } from 'react';
import { Send, Loader2, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { hustleService } from '@/services/hustleService';
import { format } from 'date-fns';
import { useHustleChat } from '@/hooks/useHustleChat';

interface HustleChatProps {
  hustleId: string;
}

const HustleChat = ({ hustleId }: HustleChatProps) => {
  const [message, setMessage] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  useHustleChat(hustleId);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['hustle-messages', hustleId],
    queryFn: () => hustleService.getMessages(hustleId),
    refetchInterval: 5000 // Poll every 5 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => hustleService.sendMessage(hustleId, message),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['hustle-messages', hustleId] });
    },
    onError: () => {
      toast.error('Failed to send message');
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    hustleService.markMessagesAsRead(hustleId);
  }, [hustleId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages?.map((msg, index) => {
              const showDate = index === 0 || 
                new Date(msg.created_at).toDateString() !== 
                new Date(messages[index - 1].created_at).toDateString();

              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <div className="px-3 py-1 text-xs text-muted-foreground bg-muted rounded-full">
                        {format(new Date(msg.created_at), 'MMMM d, yyyy')}
                      </div>
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex items-start gap-2 group",
                      msg.sender_type === 'professional' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={msg.user.avatar} />
                      <AvatarFallback>
                        {msg.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "relative max-w-[80%] rounded-2xl px-4 py-2",
                      msg.sender_type === 'professional' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted rounded-tl-none"
                    )}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={cn(
                            "text-[10px] mt-1 opacity-0 group-hover:opacity-70 transition-opacity absolute bottom-1 right-2",
                            msg.sender_type === 'professional' 
                              ? "text-primary-foreground" 
                              : "text-muted-foreground"
                          )}>
                            {format(new Date(msg.created_at), 'h:mm a')}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {format(new Date(msg.created_at), 'MMM d, yyyy h:mm a')}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="pr-12 py-6 rounded-full"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full opacity-70 hover:opacity-100"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="h-12 w-12 rounded-full"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HustleChat; 