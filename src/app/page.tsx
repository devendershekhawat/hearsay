import PostComposer from '@/components/PostComposer';
import { Separator } from '@/components/ui/separator';
import { getCurrentUserProfile } from '@/app/actions/profile';
import { UserFeed } from '@/components/PostsContainer';
import { getPostsForFeed } from './actions/posts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FindPeople } from '@/components/FindPeople';
import { PostWithProfile } from '@/components/Post';
import { NoFollowingProfiles } from './people/page';

export default async function Home() {
  // Fetch data in parallel using Promise.all
  const [profileResult, postsResultForFollowing, postsResultForDiscover] = await Promise.all([
    getCurrentUserProfile(),
    getPostsForFeed({ feedType: 'following' }),
    getPostsForFeed({ feedType: 'discover' }),
  ]);

  const { profileData, profileError } = profileResult;
  const { data: initialPostsForFollowing, error: initialPostsErrorForFollowing } = postsResultForFollowing;
  const { data: initialPostsForDiscover, error: initialPostsErrorForDiscover } = postsResultForDiscover;

  if (!profileData || profileError) {
    return <div>Error fetching profile data</div>;
  }

  if (initialPostsErrorForFollowing || initialPostsErrorForDiscover) {
    return <div>{initialPostsErrorForFollowing || initialPostsErrorForDiscover}</div>;
  }

  return (
    <main className="w-full px-4 pt-10 flex gap-8">
      <section className="w-full max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-10">Your Feed</h1>
        <PostComposer profile={profileData} />
        <br />
        <Tabs defaultValue="feed">
          <TabsList>
            <TabsTrigger value="feed">Following</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
          <TabsContent value="feed">
            {initialPostsForFollowing && initialPostsForFollowing.length > 0 ? (
              <UserFeed
                initialPosts={(initialPostsForFollowing as PostWithProfile[]) || []}
                currentUserId={profileData.user_id}
                feedType="following"
                key="user-feed"
              />
            ) : (
              <NoFollowingProfiles />
            )}
          </TabsContent>
          <TabsContent value="discover">
            <UserFeed
              initialPosts={(initialPostsForDiscover as PostWithProfile[]) || []}
              currentUserId={profileData.user_id}
              feedType="discover"
              key="user-feed"
            />
          </TabsContent>
        </Tabs>
      </section>
      <div className="w-1/3 hidden lg:block">
        <FindPeople />
      </div>
    </main>
  );
}
