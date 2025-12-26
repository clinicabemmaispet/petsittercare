import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Grace period in days (configurable)
const GRACE_PERIOD_DAYS = 7;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        blocked: false,
        status: 'no_subscription'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const activeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (activeSubscriptions.data.length > 0) {
      const subscription = activeSubscriptions.data[0];
      const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const productId = subscription.items.data[0].price.product;
      const priceId = subscription.items.data[0].price.id;
      
      logStep("Active subscription found", { subscriptionId: subscription.id, productId, priceId });
      
      return new Response(JSON.stringify({
        subscribed: true,
        blocked: false,
        status: 'active',
        product_id: productId,
        price_id: priceId,
        subscription_end: subscriptionEnd
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for past_due subscriptions (within grace period)
    const pastDueSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "past_due",
      limit: 1,
    });

    if (pastDueSubscriptions.data.length > 0) {
      const subscription = pastDueSubscriptions.data[0];
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      const now = new Date();
      const gracePeriodEnd = new Date(currentPeriodEnd);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);
      
      const daysOverdue = Math.floor((now.getTime() - currentPeriodEnd.getTime()) / (1000 * 60 * 60 * 24));
      const isWithinGracePeriod = now < gracePeriodEnd;
      
      const productId = subscription.items.data[0].price.product;
      const priceId = subscription.items.data[0].price.id;
      
      logStep("Past due subscription found", { 
        subscriptionId: subscription.id, 
        daysOverdue, 
        isWithinGracePeriod,
        gracePeriodEnd: gracePeriodEnd.toISOString()
      });
      
      return new Response(JSON.stringify({
        subscribed: isWithinGracePeriod,
        blocked: !isWithinGracePeriod,
        status: 'past_due',
        days_overdue: daysOverdue,
        grace_period_remaining: Math.max(0, GRACE_PERIOD_DAYS - daysOverdue),
        product_id: productId,
        price_id: priceId,
        subscription_end: currentPeriodEnd.toISOString(),
        grace_period_end: gracePeriodEnd.toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for canceled/unpaid subscriptions
    const allSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 5,
    });

    let lastSubscription = null;
    for (const sub of allSubscriptions.data) {
      if (sub.status === 'canceled' || sub.status === 'unpaid') {
        lastSubscription = sub;
        break;
      }
    }

    if (lastSubscription) {
      logStep("Canceled/unpaid subscription found", { 
        status: lastSubscription.status,
        subscriptionId: lastSubscription.id 
      });
      
      return new Response(JSON.stringify({
        subscribed: false,
        blocked: true,
        status: lastSubscription.status,
        message: 'Sua assinatura foi cancelada ou não foi paga. Regularize para continuar usando.'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No active subscription found");
    return new Response(JSON.stringify({
      subscribed: false,
      blocked: false,
      status: 'no_subscription'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
