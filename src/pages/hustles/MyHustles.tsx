import React from 'react';
import { Card } from '@/components/ui/card';
import { ChatNotificationBadge } from '@/components/hustles/ChatNotificationBadge';

const HustleCard = ({ hustle }: { hustle: any }) => {
  return (
    <Card className="relative">
      {hustle.unread_messages > 0 && (
        <div className="absolute top-4 right-4">
          <ChatNotificationBadge count={hustle.unread_messages} />
        </div>
      )}
      {/* ... rest of card content ... */}
    </Card>
  );
};

export default HustleCard; 