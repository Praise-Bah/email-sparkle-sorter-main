import React, { useState, useEffect, createContext } from 'react';
import type { Email } from '@/utils/emailUtils';
import { fetchEmailsFromLast7Days } from '@/utils/emailUtils';
import { extractTasks, Task } from '@/lib/openai';
import TaskCard from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Create context for email read status updates
export const EmailReadContext = createContext<{
  markEmailRead: (emailId: string) => void;
}>({ 
  markEmailRead: () => {} 
});

const ImportantUpdates: React.FC = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<Email[]>([]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const fetchedEmails: Email[] = await fetchEmailsFromLast7Days();
      setEmails(fetchedEmails);
      const extracted: Task[] = await extractTasks(fetchedEmails);
      setTasks(extracted);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({ title: 'Error', description: 'Failed to load important updates.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to update local email read status
  const markEmailRead = (emailId: string) => {
    // Update our local emails state to mark this email as read
    setEmails(prevEmails => 
      prevEmails.map(email => 
        email.id === emailId ? { ...email, read: true } : email
      )
    );
    
    // Also update any tasks associated with this email
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.emailId === emailId ? { ...task, emailRead: true } : task
      )
    );
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <EmailReadContext.Provider value={{ markEmailRead }}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Important Updates</h1>
        <Button onClick={loadTasks} disabled={loading} className="mb-4">
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
        {loading && <p>Loading tasks...</p>}
        {!loading && tasks.length === 0 && <p>No important updates found.</p>}
        {!loading && tasks.map((task) => (
          <TaskCard key={task.emailId} task={task} />
        ))}
      </div>
    </EmailReadContext.Provider>
  );
};

export default ImportantUpdates;