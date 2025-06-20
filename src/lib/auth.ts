'use client';
import { useAuth as useClerkAuth } from '@clerk/nextjs';
import { UserRole } from '@prisma/client';
import { useEffect, useState } from 'react';

interface UseAuthReturn {
  userId: string | null;
  userRole: UserRole | null;
  isLoading: boolean;
}

export function useAuth(): UseAuthReturn {
  const { userId } = useClerkAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!userId) {
        setUserRole(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, [userId]);

  return {
    userId: userId ?? null,
    userRole,
    isLoading
  };
}
