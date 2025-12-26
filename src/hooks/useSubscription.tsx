import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionState {
  subscribed: boolean;
  blocked: boolean;
  status: string;
  priceId?: string;
  productId?: string;
  subscriptionEnd?: string;
  gracePeriodEnd?: string;
  daysOverdue?: number;
  gracePeriodRemaining?: number;
  loading: boolean;
  error?: string;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  isActive: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    blocked: false,
    status: 'loading',
    loading: true,
  });

  const checkSubscription = async () => {
    if (!user) {
      setState({
        subscribed: false,
        blocked: false,
        status: 'no_user',
        loading: false,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState({
          subscribed: false,
          blocked: false,
          status: 'no_session',
          loading: false,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setState({
        subscribed: data.subscribed ?? false,
        blocked: data.blocked ?? false,
        status: data.status ?? 'unknown',
        priceId: data.price_id,
        productId: data.product_id,
        subscriptionEnd: data.subscription_end,
        gracePeriodEnd: data.grace_period_end,
        daysOverdue: data.days_overdue,
        gracePeriodRemaining: data.grace_period_remaining,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState({
        subscribed: false,
        blocked: false,
        status: 'error',
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao verificar assinatura',
      });
    }
  };

  useEffect(() => {
    checkSubscription();
  }, [user]);

  // Auto-refresh subscription status every 60 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const isActive = state.subscribed && !state.blocked;

  return (
    <SubscriptionContext.Provider value={{ ...state, checkSubscription, isActive }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
