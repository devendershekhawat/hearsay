import Link from 'next/link';

export const NoFollowingProfiles = () => {
  return (
    <div className="text-center py-8">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No profiles followed yet</h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Start by discovering interesting people to follow</p>
      <Link
        href="/people?type=discover"
        className="mt-4 inline-block px-4 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
      >
        Discover People
      </Link>
    </div>
  );
};
