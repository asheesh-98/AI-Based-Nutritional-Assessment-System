import { Link } from 'react-router-dom';
import { Utensils, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#060a14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">NutriAI</span>
            </Link>
            <p className="text-sm text-gray-500 max-w-sm">
              AI-powered nutritional assessment system that detects deficiencies,
              generates personalized meal plans, and helps you achieve optimal health.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <div className="space-y-2.5">
              {['Dashboard', 'Assessment', 'Meal Plans', 'Food Diary'].map((item) => (
                <a key={item} href="#" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
            <div className="space-y-2.5">
              {['Documentation', 'API Reference', 'Contact', 'Privacy Policy'].map((item) => (
                <a key={item} href="#" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} NutriAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Github, Twitter, Mail].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-600 hover:text-gray-400 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
