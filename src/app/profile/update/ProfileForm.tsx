'use client';

import Image from 'next/image';
import { Database } from '@/database.types';
import { useDebounce } from '@uidotdev/usehooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FaUpload } from 'react-icons/fa';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useRef } from 'react';
import { checkUsername, createProfile, uploadFile } from '../profile.actions';
import { unique } from 'next/dist/build/utils';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ProfileFormProps = {
  initialProfileData: Database['public']['Tables']['Profile']['Insert'];
  createMode: boolean;
};

const formSchema = z.object({
  first_name: z.string().min(1, { message: 'First name is required' }),
  last_name: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  username: z.string().min(1, { message: 'Username is required' }),
  bio: z.string().optional(),
  photo_url: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export default function ProfileForm({ initialProfileData, createMode }: ProfileFormProps) {
  const [isUnique, setIsUnique] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: initialProfileData.first_name || '',
      last_name: initialProfileData.last_name || '',
      email: initialProfileData.email || '',
      username: initialProfileData.username || '',
      bio: initialProfileData.bio || '',
      photo_url: initialProfileData.photo_url || '',
    },
  });

  const username = form.watch('username');
  const photo_url = form.watch('photo_url');
  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    const check = async () => {
      if (!debouncedUsername || debouncedUsername === initialProfileData.username) {
        setIsUnique(false);
        return;
      }
      setIsBusy(true);
      const isUnique = await checkUsername(debouncedUsername);
      setIsUnique(isUnique);
      if (!isUnique) {
        form.setError('username', { message: 'Username is not unique' });
      } else {
        form.clearErrors('username');
      }
      setIsBusy(false);
    };
    check();

    return () => {
      setIsUnique(false);
      setIsBusy(false);
    };
  }, [debouncedUsername]);

  const first_name_error = form.formState.errors.first_name;
  const last_name_error = form.formState.errors.last_name;
  const username_error = form.formState.errors.username;
  const email_error = form.formState.errors.email;
  const photo_url_error = form.formState.errors.photo_url;
  const onSubmit = async (data: FormSchema) => {
    const result = await createProfile(data);
    if (result.error) {
      form.setError('root', { message: result.error });
    }
  };

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBusy(true);
    const { publicUrl, error } = await uploadFile(file);
    if (error || !publicUrl) {
      toast({
        title: 'Failed to upload file',
        variant: 'destructive',
      });
      form.setError('photo_url', { message: 'Failed to upload file' });
    } else {
      form.setValue('photo_url', publicUrl);
    }
    setIsBusy(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{createMode ? 'Create your profile' : 'Update your profile'}</CardTitle>
        <CardDescription>
          These details are pre filled with your social login details. You can edit them to your liking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 items-center justify-center">
            <div className="relative h-24 w-24">
              <Image
                src={photo_url || 'https://i.sstatic.net/l60Hf.png'}
                alt="Profile photo"
                fill
                className="object-cover rounded-full"
              />
            </div>
            <input accept="image/*" type="file" ref={fileInputRef} hidden onChange={onFileUpload} />
            <Button size="sm" className="w-40" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <FaUpload />
              {photo_url ? 'Change photo' : 'Upload photo'}
            </Button>
            {photo_url_error && <FormMessage className="text-red-500">{photo_url_error.message}</FormMessage>}
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      {first_name_error && (
                        <FormMessage className="text-red-500">{first_name_error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      {last_name_error && <FormMessage className="text-red-500">{last_name_error.message}</FormMessage>}
                    </FormItem>
                  )}
                />
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Select a unique username" />
                        </FormControl>
                        {username_error && <FormMessage className="text-red-500">{username_error.message}</FormMessage>}
                        {!isBusy && isUnique && (
                          <FormMessage className="text-green-500">Username is unique</FormMessage>
                        )}
                        {isBusy && <FormMessage className="text-gray-500">Checking...</FormMessage>}
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Tell us a little about yourself" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        {email_error && <FormMessage className="text-red-500">{email_error.message}</FormMessage>}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
      <CardFooter>
        {form.formState.errors.root && (
          <FormMessage className="text-red-500">{form.formState.errors.root.message}</FormMessage>
        )}
        <Button
          onClick={form.handleSubmit(onSubmit)}
          type="submit"
          className="w-full"
          disabled={isBusy || !form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {createMode ? 'Create profile' : 'Update profile'}
        </Button>
      </CardFooter>
    </Card>
  );
}
