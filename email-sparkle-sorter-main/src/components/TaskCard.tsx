import React, { useState, useContext } from 'react';
import type { Task } from '@/lib/openai';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { markEmailAsRead } from '@/lib/googleAuth';
import { useToast } from '@/hooks/use-toast';
import { EmailReadContext } from '@/pages/ImportantUpdates';

type Props = { task: Task };

const toGoogleCalUrl = (t: Task) => {
  if (!t.due) return '';
  const start = format(t.due, "yyyyMMdd'T'HHmmss'Z'");
  const end = format(new Date(t.due.getTime() + 60 * 60 * 1000), "yyyyMMdd'T'HHmmss'Z'");
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: t.subject,
    dates: `${start}/${end}`,
    details: t.details,
    location: t.links.join('\n'),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
};

const TaskCard: React.FC<Props> = ({ task }) => {
  const { toast } = useToast();
  const { markEmailRead } = useContext(EmailReadContext);
  const [isMarkedRead, setIsMarkedRead] = useState(task.emailRead || false);
  
  const handleAddToCalendar = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't prevent default so the calendar link still opens
    
    // Only try to mark as read if not already marked
    if (!isMarkedRead) {
      const success = await markEmailAsRead(task.emailId);
      if (success) {
        setIsMarkedRead(true);
        // Update the context to reflect the change in email read status
        markEmailRead(task.emailId);
        toast({
          title: "Email marked as read",
          description: "The email has been marked as read in Gmail."
        });
      } else {
        toast({
          title: "Failed to mark email as read",
          description: "Please try again or check your connection.",
          variant: "destructive"
        });
      }
    }
  };
  
  return (
  <div className="p-4 border rounded-lg shadow-sm">
    <p><strong>Due:</strong> {task.due ? task.due.toLocaleString() : 'No due date'}</p>
    <p><strong>Details:</strong> {task.details}</p>
    {task.links.length > 0 && (
      <ul className="list-disc ml-5">
        {task.links.map(link => (
          <li key={link}>
            <a href={link} className="text-blue-600" target="_blank" rel="noreferrer">
              {link}
            </a>
          </li>
        ))}
      </ul>
    )}
    {task.due && (
      <Button asChild className="mt-2">
        <a
          href={toGoogleCalUrl(task)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleAddToCalendar}
        >
          {isMarkedRead ? "Added to calendar" : "Add to calendar"}
        </a>
      </Button>
    )}
  </div>
  );
};

export default TaskCard;
