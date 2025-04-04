
import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    role: 'Software Engineer',
    avatar: 'https://i.pravatar.cc/150?img=11',
    content: 'BiteStop has revolutionized my daily commute. Now I can enjoy fresh food while stuck in traffic. The vendors are reliable and the food is always fresh!',
    rating: 5
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'Marketing Manager',
    avatar: 'https://i.pravatar.cc/150?img=5',
    content: 'As someone who drives 50km daily, this app is a lifesaver. I can get my favorite chai and samosa without any detours.',
    rating: 4
  },
  {
    id: 3,
    name: 'Amit Joshi',
    role: 'Delivery Driver',
    avatar: 'https://i.pravatar.cc/150?img=12',
    content: 'Perfect for long drives! I use it during my intercity trips and it makes the journey so much more enjoyable.',
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight">What Our Customers Say</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            Don't just take our word for it — hear from some of our satisfied customers!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-traffic-yellow fill-traffic-yellow' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
