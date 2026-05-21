import { Truck, BadgePercent, ShieldCheck, HeartPulse } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: <Truck className="w-10 h-10 text-emerald-600" />,
      title: "Fast & Safe Delivery",
      description: "Carefully transported in temperature-controlled, authorized specialized pet courier boxes with expert attendants."
    },
    {
      icon: <BadgePercent className="w-10 h-10 text-teal-600" />,
      title: "Lowest Price Guaranteed",
      description: "Direct breeder-to-home aviary network ensures best values in India without speculative retail markups."
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />,
      title: "Guaranteed Legal & Captive Bred",
      description: "100% captive-bred pets registered with legal Parivesh registries, protecting global bird sanctuaries."
    },
    {
      icon: <HeartPulse className="w-10 h-10 text-teal-600" />,
      title: "Veterinarian Health Card",
      description: "Every parrot comes with certified standard negative viral profiles, complete DNA de-worming status, and age reports."
    }
  ];

  return (
    <section className="bg-slate-50 py-12 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-100 transition-all duration-300 flex items-start gap-4"
            >
              <div className="p-3 bg-slate-50 rounded-xl flex-shrink-0">
                {badge.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-semibold text-slate-950 text-sm tracking-tight">
                  {badge.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
