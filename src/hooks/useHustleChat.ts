import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { pusher } from '@/lib/pusher';
import { toast } from 'sonner';

export const useHustleChat = (hustleId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = pusher.subscribe(`hustle.${hustleId}`);

    channel.bind('new-message', (data: any) => {
      // Update messages in cache
      queryClient.invalidateQueries({ queryKey: ['hustle-messages', hustleId] });

      // Show notification if message is from admin
      if (data.message.sender_type === 'admin') {
        toast(
          'New Message',
          {
            description: data.message.message,
            action: {
              label: 'View',
              onClick: () => {
                // Navigate to chat if needed
              }
            }
          }
        );
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [hustleId, queryClient]);
}; 