import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const SUPER_ADMIN_EMAIL = 'thalesfernandesmkt@gmail.com';

export function useSuperAdmin() {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!user) {
        setIsSuperAdmin(false);
        setIsMaster(false);
        setLoading(false);
        return;
      }

      // Check if user is the super admin by email
      const isSuper = user.email === SUPER_ADMIN_EMAIL;
      setIsSuperAdmin(isSuper);

      // Check if user has 'master' role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'master')
        .maybeSingle();

      setIsMaster(!!roleData || isSuper);
      setLoading(false);
    }

    checkRole();
  }, [user]);

  return { isSuperAdmin, isMaster, loading, superAdminEmail: SUPER_ADMIN_EMAIL };
}
