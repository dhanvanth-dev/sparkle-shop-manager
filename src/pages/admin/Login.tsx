
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LucideLoader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  useEffect(() => {
    // Redirect if user is already logged in as admin
    if (user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // First, check if the email exists in the admins table
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', data.email)
        .maybeSingle();
        
      if (adminError) {
        throw new Error('Error checking admin status');
      }
      
      if (!adminData) {
        toast.error('Invalid admin credentials');
        setIsLoading(false);
        return;
      }
      
      // Check if password matches
      if (adminData.password !== data.password) {
        toast.error('Invalid admin credentials');
        setIsLoading(false);
        return;
      }
      
      // If admin exists and password matches, sign in with Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) {
        // If auth error, try signup (admin might not have an auth account yet)
        const { error: signupError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              is_admin: true
            }
          }
        });
        
        if (signupError) {
          throw signupError;
        }
        
        toast.success('Admin account created and signed in');
        
        // We need to manually update admin status since the auth state change might not have fired yet
        const { error: updateError } = await supabase
          .from('admins')
          .update({ created_at: new Date().toISOString() })
          .eq('email', data.email);
          
        if (updateError) {
          console.error('Error updating admin:', updateError);
        }
      } else {
        toast.success('Signed in as admin');
      }
      
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Invalid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
