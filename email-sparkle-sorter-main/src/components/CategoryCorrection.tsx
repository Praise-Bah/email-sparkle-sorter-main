import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Flag } from 'lucide-react';
import { getAccessToken } from '@/lib/googleAuth';

interface CategoryCorrectionProps {
  emailId: string;
}

const CategoryCorrection: React.FC<CategoryCorrectionProps> = ({
  emailId
}) => {
  const { toast } = useToast();

  // Handler to delete email in Gmail and refresh UI
  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Stop the click from bubbling up

    const token = getAccessToken();
    if (!token) {
      toast({ variant: 'destructive', title: 'Auth Error', description: 'Not authenticated' });
      return;
    }

    try {
      console.log(`Attempting to delete email with ID: ${emailId}`);

      // First try: Add TRASH label and remove from INBOX
      console.log('Attempting modify endpoint...');
      const modifyRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          addLabelIds: ['TRASH'],
          removeLabelIds: ['INBOX']
        })
      });

      const modifyStatus = modifyRes.status;
      const modifyText = await modifyRes.text();
      console.log('Modify response status:', modifyStatus);
      console.log('Modify response body:', modifyText);

      if (modifyRes.ok) {
        toast({ title: 'Deleted', description: 'Email moved to Trash via modify' });
        window.location.reload(); // Refresh to show changes
        return;
      }
      console.log(`Modify endpoint failed with status: ${modifyStatus}`);


      // Second try: Use trash endpoint
      console.log('Attempting trash endpoint...');
      const trashRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/trash`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const trashStatus = trashRes.status;
      const trashText = await trashRes.text();
      console.log('Trash response status:', trashStatus);
      console.log('Trash response body:', trashText);

      if (trashRes.ok) {
        toast({ title: 'Deleted', description: 'Email moved to Trash via trash endpoint' });
        window.location.reload();
        return;
      }
       console.log(`Trash endpoint failed with status: ${trashStatus}`);


      // Third try: Permanent delete
      console.log('Attempting permanent delete endpoint...');
       const deleteRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`, {
         method: 'DELETE',
         headers: { 'Authorization': `Bearer ${token}` }
       });

       const deleteStatus = deleteRes.status;
       console.log('Delete response status:', deleteStatus);

       if (deleteRes.ok) {
         toast({ title: 'Deleted', description: 'Email permanently deleted' });
         window.location.reload();
         return;
       }
       console.log(`Delete endpoint failed with status: ${deleteStatus}`);

       // If all methods fail
       toast({ 
         variant: 'destructive', 
         title: 'Error', 
         description: `Could not delete email. Check console for API error details. Last status: ${deleteStatus}` 
       });

    } catch (error) {
      console.error('Delete email error:', error);
      toast({
        variant: 'destructive',
        title: 'Network Error',
        description: error instanceof Error ? error.message : 'Failed to communicate with server'
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      title="Delete email"
      onClick={handleDelete} // Pass the event to the handler
    >
      <Flag className="h-4 w-4 text-red-600" />
      <span className="sr-only">Delete email</span>
    </Button>
  );
};

export default CategoryCorrection;
