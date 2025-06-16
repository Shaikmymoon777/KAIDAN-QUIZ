import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MessageCircle, User, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, ToastContainer } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Gmail compose window with pre-filled data
      const subject = encodeURIComponent(formData.subject || 'Japanese Learning App Feedback');
      const body = encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      );
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=support@japanese-learning.app&su=${subject}&body=${body}`;
      
      window.open(gmailUrl, '_blank');
      
      addToast({
        type: 'success',
        message: 'Gmail compose window opened. Please send your message from there.'
      });
      
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to open Gmail:', error);
      addToast({
        type: 'error',
        message: 'Failed to open Gmail. Please try again or contact us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help with technical issues or general questions',
      contact: 'support@japanese-learning.app',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Feedback',
      description: 'Share your thoughts and suggestions for improvement',
      contact: 'feedback@japanese-learning.app',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: User,
      title: 'General Inquiries',
      description: 'Questions about features, pricing, or partnerships',
      contact: 'hello@japanese-learning.app',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const faqItems = [
    {
      question: 'How do I unlock new quiz sets?',
      answer: 'Complete the previous set with a score of 60% or higher to unlock the next set.'
    },
    {
      question: 'Can I practice offline?',
      answer: 'Yes! Our app works offline once you\'ve loaded it. Your progress will sync when you\'re back online.'
    },
    {
      question: 'How accurate is the speech recognition?',
      answer: 'Our speech recognition uses your browser\'s built-in technology. Accuracy may vary depending on your microphone quality and pronunciation.'
    },
    {
      question: 'Can I reset my progress?',
      answer: 'Currently, progress is stored locally. You can clear your browser data to reset, but this will remove all your achievements.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ToastContainer />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions, feedback, or need help? We're here to support your Japanese learning journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Send className="w-6 h-6 text-indigo-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900">
                Send us a Message
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 transition-all duration-300 hover:border-indigo-300"
                    placeholder="Your name"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 transition-all duration-300 hover:border-indigo-300"
                    placeholder="your@email.com"
                  />
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 transition-all duration-300 hover:border-indigo-300"
                >
                  <option value="">Select a subject</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="General Feedback">General Feedback</option>
                  <option value="Other">Other</option>
                </select>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 resize-none transition-all duration-300 hover:border-indigo-300"
                  placeholder="Tell us how we can help you..."
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <motion.div 
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Opening Gmail...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>Send via Gmail</span>
                    <ExternalLink size={16} />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Other Ways to Reach Us
              </h3>
              
              <div className="space-y-4">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <motion.div
                      key={method.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                    >
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {method.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {method.description}
                        </p>
                        <a
                          href={`mailto:${method.contact}`}
                          className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors duration-300"
                        >
                          {method.contact}
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div 
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="border-b border-gray-200 pb-4 last:border-b-0 hover:bg-gray-50 p-3 rounded-lg transition-all duration-300"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {item.question}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {item.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Gmail Integration Notice */}
            <motion.div 
              className="bg-blue-50 border border-blue-200 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Gmail Integration
                  </h4>
                  <p className="text-blue-800 text-sm">
                    Our contact form opens Gmail with your message pre-filled for easy sending. 
                    We typically respond within 24-48 hours during business days.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}