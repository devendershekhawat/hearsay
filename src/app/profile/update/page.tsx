import { createClient } from '@/utils/supabase/server';
import ProfileForm from './ProfileForm';
import { Database } from '@/database.types';

type ProfileInsert = Database['public']['Tables']['Profile']['Insert'];
type ProfileRow = Database['public']['Tables']['Profile']['Row'];

export default async function ProfileCreatePage() {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (!userData || userError) {
    return <div>Error fetching user data</div>;
  }

  const { data: profileData, error: profileError } = await supabase
    .from('Profile')
    .select('*')
    .eq('user_id', userData.user.id)
    .single();

  let createMode = false;
  if (profileError && profileError.code === 'PGRST116') {
    createMode = true;
  } else if (!profileData) {
    return <div>Profile not found</div>;
  }

  const initialProfileData: ProfileInsert | null = createMode
    ? {
        user_id: userData.user.id,
        username: '',
        bio: '',
        first_name: userData.user.user_metadata.full_name.split(' ')[0] ?? '',
        last_name: userData.user.user_metadata.full_name.split(' ')[1] ?? '',
        email: userData.user.email ?? '',
        photo_url: userData.user.user_metadata.avatar_url ?? '',
      }
    : profileData;

  if (!initialProfileData) {
    return <div>Profile not found</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center pt-10 px-4 w-full">
      <ProfileForm initialProfileData={initialProfileData} createMode={createMode} />
    </main>
  );
}
