import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideLoader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileFormData {
  fullName: string;
  email: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, profile, refreshProfile, isAdmin, signOut } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: profile?.full_name || '',
      email: profile?.email || '',
    }
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?returnTo=/profile');
    }
    
    if (profile) {
      reset({
        fullName: profile.full_name || '',
        email: profile.email || '',
      });
    }
  }, [user, loading, navigate, profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase.rpc(
        'update_user_profile',
        {
          user_id: user.id,
          new_full_name: data.fullName
        }
      );

      if (error) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: data.fullName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id) as any;

        if (updateError) throw updateError;
      }

      await refreshProfile(user.id);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || !profile) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <LucideLoader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-28 pb-16">
        <h1 className="text-3xl font-serif mb-8">Your Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    {...register('fullName', {
                      required: 'Full name is required',
                    })}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    disabled
                    {...register('email')}
                  />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <Button 
                  type="submit" 
                  className="bg-gold hover:bg-gold-dark"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/saved-items')}
              >
                View Saved Items
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => navigate('/cart')}
              >
                View Cart
              </Button>
              
              {isAdmin && (
                <Button 
                  variant="outline"
                  className="w-full bg-gold hover:bg-gold-dark text-white"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  Admin Dashboard
                </Button>
              )}
              
              <Button 
                variant="destructive"
                className="w-full"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
