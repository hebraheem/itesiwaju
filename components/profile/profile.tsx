'use client';

import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Phone, Calendar, Edit, Save } from 'lucide-react';
import { useState } from 'react';

export function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information</p>
      </motion.div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Personal Information</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="w-4 h-4 mr-2" />{isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-orange-500 text-white text-3xl font-bold">
                {user?.firstName[0]}{user?.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                <Badge>{user?.status}</Badge>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label>First Name</Label><Input defaultValue={user?.firstName} disabled={!isEditing} /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input defaultValue={user?.lastName} disabled={!isEditing} /></div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Mail className="w-4 h-4" />Email</Label>
            <Input type="email" defaultValue={user?.email} disabled={!isEditing} />
          </div>

          {isEditing && (
            <Button className="bg-orange-500 hover:bg-orange-600" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
