import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Users, AlertTriangle, Scale, Mail } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-orange-100">
              Please read these terms and conditions carefully before using our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Last Updated */}
        <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <strong>Last updated:</strong> December 22, 2024
          </p>
        </div>

        {/* Acceptance */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Acceptance of Terms
            </h2>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            By accessing and using the Uluntu Community platform ("Service"), you accept and agree 
            to be bound by the terms and provision of this agreement. If you do not agree to abide by 
            the above, please do not use this service.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            These Terms of Service ("Terms") govern your use of our website and services operated by 
            Uluntu Community ("us", "we", or "our").
          </p>
        </section>

        {/* Account Terms */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Users className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Account Terms
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Registration Requirements
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• You must be at least 18 years old to use this service</li>
                <li>• You must provide accurate and complete registration information</li>
                <li>• You are responsible for maintaining the security of your account</li>
                <li>• You must notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Account Responsibilities
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• You are responsible for all activities that occur under your account</li>
                <li>• You may not use your account for any illegal or unauthorized purpose</li>
                <li>• You may not violate any laws in your jurisdiction when using the Service</li>
                <li>• One person or legal entity may not maintain more than one account</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Acceptable Use */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Acceptable Use Policy
            </h2>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              You agree to use the Service only for purposes that are:
            </h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 ml-6">
              <li>• Legal, proper, and in accordance with these Terms</li>
              <li>• Professional and appropriate for a technology community</li>
              <li>• Respectful of other users' rights and privacy</li>
              <li>• Consistent with community guidelines and standards</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
            <div className="flex items-start mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Prohibited Activities
              </h3>
            </div>
            <p className="text-red-700 dark:text-red-300 mb-4">
              You may not use the Service to:
            </p>
            <ul className="space-y-2 text-red-700 dark:text-red-300 text-sm">
              <li>• Post illegal, harmful, threatening, abusive, or discriminatory content</li>
              <li>• Spam or send unsolicited commercial communications</li>
              <li>• Impersonate another person or entity</li>
              <li>• Violate intellectual property rights</li>
              <li>• Upload malicious code or attempt to compromise security</li>
              <li>• Engage in harassment or bullying behavior</li>
              <li>• Share false or misleading information</li>
              <li>• Use automated scripts or bots without permission</li>
            </ul>
          </div>
        </section>

        {/* Content Policy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Content and Intellectual Property
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Your Content
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-3">
                You retain ownership of content you post on the Service. By posting content, you grant us 
                a worldwide, non-exclusive, royalty-free license to use, display, and distribute your 
                content on the platform.
              </p>
              <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                <li>• You are responsible for the content you post</li>
                <li>• You must have the right to post the content you share</li>
                <li>• We may remove content that violates these Terms</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Platform Content
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                The Service and its original content, features, and functionality are owned by Uluntu 
                Community and are protected by international copyright, trademark, patent, trade secret, 
                and other intellectual property laws.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Privacy and Data Protection
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
            your information when you use the Service. By using the Service, you agree to the collection 
            and use of information in accordance with our Privacy Policy.
          </p>
          <Link 
            to="/privacy" 
            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold"
          >
            Read our Privacy Policy →
          </Link>
        </section>

        {/* Service Availability */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Service Availability
          </h2>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg">
            <p className="text-amber-800 dark:text-amber-200">
              <strong>Service "As Is":</strong> We provide the Service on an "as is" and "as available" 
              basis. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </div>
          <div className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
            <p>• We may modify, suspend, or discontinue any part of the Service at any time</p>
            <p>• We reserve the right to refuse service to anyone at any time</p>
            <p>• We may implement usage limits or restrictions</p>
            <p>• We may perform maintenance that temporarily limits access</p>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Scale className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Disclaimers and Limitations
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Disclaimer of Warranties
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                TO THE FULLEST EXTENT PERMITTED BY LAW, NELSON TECH COMMUNITY DISCLAIMS ALL WARRANTIES, 
                EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
                NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE OR UNINTERRUPTED.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Limitation of Liability
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                IN NO EVENT SHALL NELSON TECH COMMUNITY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
                CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, OR GOODWILL, 
                ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </div>
          </div>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Termination
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-300">
            <p>
              We may terminate or suspend your account and access to the Service immediately, without 
              prior notice or liability, for any reason, including if you breach these Terms.
            </p>
            <p>
              You may terminate your account at any time by contacting us or using the account deletion 
              feature in your profile settings.
            </p>
            <p>
              Upon termination, your right to use the Service will cease immediately. Content you posted 
              may remain on the platform unless you specifically request its removal.
            </p>
          </div>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Governing Law
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            These Terms shall be interpreted and governed by the laws of British Columbia, Canada, 
            without regard to conflict of law provisions. Any legal action or proceeding arising 
            under these Terms will be brought exclusively in the courts of British Columbia.
          </p>
        </section>

        {/* Changes to Terms */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Changes to Terms
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, 
            we will provide at least 30 days' notice prior to any new terms taking effect.
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        {/* Contact */}
        <section>
          <div className="flex items-center mb-6">
            <Mail className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Contact Information
            </h2>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <p><strong>Email:</strong> legal@nelsontech.community</p>
              <p><strong>Contact Page:</strong> <Link to="/contact" className="text-orange-600 dark:text-orange-400 hover:underline">nelsontech.community/contact</Link></p>
              <p><strong>Mail:</strong> Uluntu Community, Legal Department, Nelson, BC, Canada</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}