'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { getPeople } from '@/app/actions/people';
import { Database } from '@/database.types';
import { FollowButton } from './FollowButton';
import { Skeleton } from './ui/skeleton';
import { ProfileHoverCard } from './ProfileHoverCard';
import Link from 'next/link';

export function FindPeople() {
  const [people, setPeople] = useState<Database['public']['Tables']['Profile']['Row'][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      setIsLoading(true);
      const { data, error } = await getPeople();
      console.log({ data, error });
      setPeople(data || []);
      setIsLoading(false);
    };
    fetchPeople();
  }, []);

  console.log(people);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find people</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-[200px] h-[10px]" />
        ) : (
          <div>
            {people.map((person) => (
              <div key={person.user_id} className="flex justify-between py-2">
                <ProfileHoverCard profile={{ ...person, am_i_following: false }} isCurrentUser={false}>
                  <Link href={`/profile/${person.username}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 relative overflow-hidden">
                      <Image src={person.photo_url!} alt={person.username} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {person.first_name} {person.last_name}
                      </div>
                      <div className="text-sm text-gray-500">@{person.username}</div>
                    </div>
                  </Link>
                </ProfileHoverCard>
                <FollowButton profileId={person.user_id} amIFollowingUser={false} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
