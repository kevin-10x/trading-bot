import { trpc } from "@/providers/trpc";
import { Check, Crown, Zap, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Subscription() {
  const plansQuery = trpc.subscriptions.plans.useQuery();
  const currentQuery = trpc.subscriptions.current.useQuery({ userId: "default" });

  const plans = plansQuery.data || [];
  const current = currentQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
        <p className="text-gray-400 mt-2">
          Start with a 30-day free trial. No credit card required.
        </p>
        {current?.isTrial && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">
              Trial Active - {current.daysRemaining} days remaining
            </span>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={current?.plan === plan.id}
            isTrial={current?.isTrial}
          />
        ))}
      </div>

      {/* Trial Info */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-xl p-6 text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          Why upgrade after trial?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <FeatureItem
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="Unlimited Signals"
            description="Get AI-powered trading signals without limits"
          />
          <FeatureItem
            icon={<Crown className="w-6 h-6 text-purple-400" />}
            title="All Markets"
            description="Access Crypto, Forex, Stocks, and Commodities"
          />
          <FeatureItem
            icon={<Building2 className="w-6 h-6 text-blue-400" />}
            title="AI Assistant"
            description="Chat with our AI trading assistant 24/7"
          />
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-[#111827] rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <FAQItem
            question="What happens after my trial ends?"
            answer="After 30 days, you'll be prompted to choose a paid plan. Your data will be preserved for 7 days to give you time to decide."
          />
          <FAQItem
            question="Can I cancel anytime?"
            answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
          />
          <FAQItem
            question="Is there a refund policy?"
            answer="We offer a 7-day money-back guarantee on all paid plans."
          />
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  isTrial,
}: {
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
  isCurrent: boolean;
  isTrial?: boolean;
}) {
  const utils = trpc.useUtils();
  const subscribe = trpc.subscriptions.subscribe.useMutation({
    onSuccess: () => {
      utils.subscriptions.current.invalidate();
    },
  });

  const isPopular = plan.id === "professional";
  const isFree = plan.price === 0;

  return (
    <div
      className={`relative bg-[#111827] rounded-xl border p-6 flex flex-col ${
        isPopular
          ? "border-purple-500/50 shadow-lg shadow-purple-500/10"
          : "border-gray-800"
      } ${isCurrent ? "ring-2 ring-blue-500" : ""}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-xs font-semibold text-white">
          Most Popular
        </div>
      )}

      {/* Current Badge */}
      {isCurrent && (
        <div className="absolute -top-3 right-4 px-3 py-1 bg-blue-500 rounded-full text-xs font-semibold text-white">
          Current
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            ${plan.price}
          </span>
          {!isFree && (
            <span className="text-gray-400">/month</span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        onClick={() =>
          subscribe.mutate({ userId: "default", planId: plan.id as any })
        }
        disabled={isCurrent && !isTrial}
        className={`w-full ${
          isPopular
            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            : isCurrent
            ? "bg-gray-700 cursor-default"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        {isCurrent && !isTrial
          ? "Current Plan"
          : isCurrent && isTrial
          ? "Upgrade Now"
          : isFree
          ? "Get Started"
          : "Subscribe"}
      </Button>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="text-white font-medium mb-1">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="border-b border-gray-800 pb-4">
      <h4 className="text-white font-medium mb-1">{question}</h4>
      <p className="text-sm text-gray-400">{answer}</p>
    </div>
  );
}
