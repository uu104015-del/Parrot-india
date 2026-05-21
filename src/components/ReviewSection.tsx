import { Star, Quote, ShieldCheck } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  birdPurchased: string;
}

export default function ReviewSection() {
  const reviews: Review[] = [
    {
      id: "rev-1",
      name: "Hitesh Sharma",
      location: "New Delhi, Delhi",
      rating: 5,
      text: "Absolutely thrilled with my Blue & Gold Macaw. Parrot India made the whole transfer process smooth and kept me thoroughly updated. The DNA card and health reports are authentic and well detailed. Highly recommended!",
      birdPurchased: "Blue & Gold Macaw (Aura)"
    },
    {
      id: "rev-2",
      name: "Ananya Deshmukh",
      location: "Mumbai, Maharashtra",
      rating: 5,
      text: "Our African Grey Echo is exceptionally smart. He started speaking 'Namaste' on his very second day! They really hand-raise these birds, and his gentle temperament with our children is proof. Exceptional customer support as well.",
      birdPurchased: "Congo African Grey (Echo)"
    },
    {
      id: "rev-3",
      name: "Rohan Varma",
      location: "Bangalore, Karnataka",
      rating: 5,
      text: "The safe delivery courier was excellent. Casper arrived perfectly active and chirping. He is extremely cuddly and raises his gorgeous crest whenever we walk into the room. He is truly the soul of our home.",
      birdPurchased: "Umbrella Cockatoo (Casper)"
    }
  ];

  return (
    <section id="testimonials-section" className="bg-white py-16 sm:py-24 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
            ★ ★ ★ ★ ★ Five Star Companion Ratings
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Loved By Families Across India
          </h2>
          <p className="text-slate-500 font-light text-sm sm:text-base leading-relaxed">
            Read heartwarming stories from certified owners who welcomed their talking soulmates into their loving homes through our registered aviary.
          </p>
        </div>

        {/* Carousel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div 
              key={rev.id} 
              className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 relative flex flex-col justify-between group hover:bg-emerald-50/20 hover:border-emerald-100 transition-all duration-300"
            >
              {/* Quote icon banner background */}
              <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-200/50 pointer-events-none" />

              <div className="space-y-4 relative z-10">
                {/* Visual Stars */}
                <div className="flex items-center gap-0.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light italic">
                  "{rev.text}"
                </p>
              </div>

              {/* Bio details */}
              <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-semibold text-slate-950 text-sm">{rev.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{rev.location}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100/60 text-emerald-800 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" /> {rev.birdPurchased}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
