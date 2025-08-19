"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  Heart,
  Search,
  FileText,
  Phone,
  Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: "1",
      category: "Getting Started",
      icon: <User className="h-4 w-4" />,
      question: "How do I complete my profile?",
      answer:
        "To complete your profile, navigate to the Profile page and fill in all required fields including your personal information, academic details, and professional links. Make sure to upload a resume and add a profile picture for better visibility to employers.",
    },
    {
      id: "2",
      category: "Getting Started",
      icon: <User className="h-4 w-4" />,
      question: "What information do I need to provide?",
      answer:
        "You'll need to provide your full name, phone number, college, department, year level, and degree information. Optional but recommended fields include your bio, portfolio link, GitHub profile, LinkedIn profile, and calendar link for scheduling interviews.",
    },
    {
      id: "3",
      category: "Getting Started",
      icon: <User className="h-4 w-4" />,
      question: "How to add Google Calendar link to your profile?",
      answer:
        "Follow this step-by-step guide to add your Google Calendar link to your profile for easy interview scheduling:",
    },
    {
      id: "4",
      category: "Job Search",
      icon: <Search className="h-4 w-4" />,
      question: "How do I search for internships?",
      answer:
        "Use the Search page to browse available internships. You can filter by location, industry, and category. Use the search bar to find specific positions or companies. Click on any job card to view detailed information.",
    },
    {
      id: "5",
      category: "Job Search",
      icon: <Search className="h-4 w-4" />,
      question: "How do I save jobs for later?",
      answer:
        "Click the heart icon on any job listing to save it. You can view all your saved jobs on the Saved Jobs page. This helps you keep track of positions you're interested in applying to.",
    },
    {
      id: "6",
      category: "Applications",
      icon: <Briefcase className="h-4 w-4" />,
      question: "How do I apply for an internship?",
      answer:
        "Click 'Apply Now' on any job listing. Make sure your profile is complete before applying. You can optionally include a cover letter with your application. All applications require a resume, which you can upload in your profile.",
    },
    {
      id: "7",
      category: "Applications",
      icon: <Briefcase className="h-4 w-4" />,
      question: "Can I track my applications?",
      answer:
        "Yes! Visit the 'My Applications' page to see all your submitted applications, their current status, and application dates. You can also view job details from this page.",
    },
    {
      id: "8",
      category: "Applications",
      icon: <Briefcase className="h-4 w-4" />,
      question: "What documents do I need to apply?",
      answer:
        "At minimum, you need a resume (PDF format, max 3MB). Some positions may also require a portfolio, GitHub profile, or cover letter. Check each job's requirements before applying.",
    },
    {
      id: "9",
      category: "Profile",
      icon: <FileText className="h-4 w-4" />,
      question: "How do I upload my resume?",
      answer:
        "Go to your Profile page and click the 'Upload' button in the Resume section. Only PDF files up to 3MB are accepted. You can preview your resume before submitting applications.",
    },
    {
      id: "10",
      category: "Profile",
      icon: <FileText className="h-4 w-4" />,
      question: "Can I update my profile after applying?",
      answer:
        "Yes, you can update your profile information at any time. However, changes won't affect applications you've already submitted. New applications will use your updated profile information.",
    },
    {
      id: "11",
      category: "Technical",
      icon: <HelpCircle className="h-4 w-4" />,
      question: "I'm having trouble logging in. What should I do?",
      answer:
        "Make sure you're using the correct email address. If you're still having issues, try clearing your browser cache or using a different browser. Contact support if the problem persists.",
    },
  ];

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const toggleFAQ = (faqId: string) => {
    setOpenFAQ(openFAQ === faqId ? null : faqId);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="container max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
          >
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </motion.div>
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Help Center
          </motion.h1>
          <motion.p
            className="text-gray-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Find answers to common questions about using BetterInternship. Get
            help with your profile, applications, and job search.
          </motion.p>
        </motion.div>

        {/* FAQ Categories */}
        <motion.div
          className="space-y-6 sm:space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + categoryIndex * 0.1, duration: 0.5 }}
            >
              <Card className="shadow-sm p-3">
                <div className="p-7 pb-4">
                  <motion.h2
                    className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.7 + categoryIndex * 0.1,
                      duration: 0.4,
                    }}
                  >
                    {faqs.find((faq) => faq.category === category)?.icon}
                    {category}
                  </motion.h2>
                </div>
                <div className="p-7 pt-0">
                  <div className="space-y-3">
                    {faqs
                      .filter((faq) => faq.category === category)
                      .map((faq, faqIndex) => (
                        <motion.div
                          key={faq.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.8 + categoryIndex * 0.1 + faqIndex * 0.05,
                            duration: 0.4,
                          }}
                        >
                          <Collapsible>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <motion.button
                                onClick={() => toggleFAQ(faq.id)}
                                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                whileHover={{
                                  backgroundColor: "rgb(249 250 251)",
                                }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <span className="font-medium text-gray-900 text-sm sm:text-base">
                                  {faq.question}
                                </span>
                                <motion.div
                                  animate={{
                                    rotate: openFAQ === faq.id ? 180 : 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {openFAQ === faq.id ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                                  )}
                                </motion.div>
                              </motion.button>
                              <AnimatePresence>
                                {openFAQ === faq.id && (
                                  <motion.div
                                    className="border-t border-gray-100"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                      duration: 0.3,
                                      ease: "easeInOut",
                                    }}
                                  >
                                    <motion.div
                                      className="px-4 pb-4 pt-2"
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      transition={{ delay: 0.1, duration: 0.2 }}
                                    >
                                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                        {faq.answer}
                                        {faq.id === "3" && (
                                          <>
                                            {" "}
                                            <a
                                              href="https://www.canva.com/design/DAGrKQdRG-8/XDGzebwKdB4CMWLOszcheg/edit"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 underline font-medium"
                                            >
                                              Link to tutorial
                                            </a>
                                          </>
                                        )}
                                      </p>
                                    </motion.div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </Collapsible>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Card className="mt-8 sm:mt-12 bg-blue-50 border-blue-200 p-3">
            <div className="p-7 text-center">
              <motion.h3
                className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.4 }}
              >
                Still need help?
              </motion.h3>
              <motion.p
                className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.4 }}
              >
                Can't find what you're looking for? Contact our support team.
              </motion.p>
              <motion.div
                className="flex items-center justify-center gap-2 text-blue-600"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.4, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="h-5 w-5" />
                <a
                  href="mailto:hello@betterinternship.com"
                  className="text-lg font-medium hover:underline"
                >
                  hello@betterinternship.com
                </a>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
