import React from 'react';
import { Shield, Eye, Lock, UserCheck, Database, Mail } from 'lucide-react';
import { useSetting } from '@/hooks/useSettings';

export default function PrivacyPage() {
  // Get contact settings with fallbacks
  const { value: privacyEmail } = useSetting('contact', 'privacy_email', 'privacy@nelsontech.community');
  const { value: privacyAddress } = useSetting('contact', 'privacy_address', 'Nelson Tech Community, Privacy Officer, Nelson, BC, Canada');
  const { value: organizationName } = useSetting('contact', 'organization_name', 'Nelson Tech Community');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-orange-100">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
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

        {/* Overview */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Overview
            </h2>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
            The {organizationName} ("we", "us", or "our") operates the {organizationName} platform. 
            This page informs you of our policies regarding the collection, use, and disclosure of personal 
            data when you use our service and the choices you have associated with that data.
          </p>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            We use your data to provide and improve the service. By using the service, you agree to 
            the collection and use of information in accordance with this policy.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Database className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Information We Collect
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Personal Information
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Name and email address</li>
                <li>• Professional information (job title, company, skills)</li>
                <li>• Profile information you choose to share</li>
                <li>• Contact preferences and communication settings</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Usage Data
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Pages visited and features used</li>
                <li>• Time spent on the platform</li>
                <li>• Device and browser information</li>
                <li>• IP address and location data (anonymized)</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                Community Content
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Posts, comments, and discussions</li>
                <li>• Event registrations and attendance</li>
                <li>• Marketplace listings and inquiries</li>
                <li>• Resource contributions and feedback</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <UserCheck className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              How We Use Your Information
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Service Provision
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Create and manage your account</li>
                <li>• Facilitate networking and connections</li>
                <li>• Process event registrations</li>
                <li>• Enable marketplace transactions</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Communication
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Send important platform updates</li>
                <li>• Notify about events and opportunities</li>
                <li>• Respond to support requests</li>
                <li>• Share community newsletters (opt-in)</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Platform Improvement
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Analyze usage patterns</li>
                <li>• Improve user experience</li>
                <li>• Develop new features</li>
                <li>• Ensure platform security</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Legal Compliance
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• Comply with legal obligations</li>
                <li>• Protect against fraud and abuse</li>
                <li>• Enforce our terms of service</li>
                <li>• Respond to legal requests</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Eye className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Data Sharing and Disclosure
            </h2>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6 rounded-lg mb-6">
            <p className="text-amber-800 dark:text-amber-200 font-semibold">
              We do not sell, trade, or rent your personal information to third parties.
            </p>
          </div>

          <p className="text-slate-600 dark:text-slate-300 mb-4">
            We may share your information only in the following circumstances:
          </p>

          <ul className="space-y-3 text-slate-600 dark:text-slate-300">
            <li>• <strong>With your consent:</strong> When you explicitly agree to share information</li>
            <li>• <strong>Service providers:</strong> Trusted partners who help us operate the platform</li>
            <li>• <strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            <li>• <strong>Business transfers:</strong> In case of merger, acquisition, or asset sale</li>
            <li>• <strong>Community features:</strong> Information you choose to make public in your profile</li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Lock className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Data Security
            </h2>
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            We implement appropriate technical and organizational measures to protect your personal 
            information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Technical Safeguards
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                <li>• Encryption in transit and at rest</li>
                <li>• Regular security audits</li>
                <li>• Secure authentication systems</li>
                <li>• Access controls and monitoring</li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Organizational Measures
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                <li>• Employee training and access limits</li>
                <li>• Data retention policies</li>
                <li>• Incident response procedures</li>
                <li>• Regular policy reviews</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <UserCheck className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Your Rights and Choices
            </h2>
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            You have the following rights regarding your personal information:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Access and Portability</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Request a copy of the personal information we hold about you.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Correction</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Update or correct inaccurate information in your profile.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Deletion</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Request deletion of your account and associated data.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Communication Preferences</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Opt out of marketing communications while keeping essential service notifications.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <Mail className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Contact Us
            </h2>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg">
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <p><strong>Email:</strong> {privacyEmail}</p>
              <p><strong>Mail:</strong> {privacyAddress}</p>
            </div>
          </div>
        </section>

        {/* Changes to Policy */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Changes to This Policy
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            We may update our Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page and updating the "Last updated" date. 
            You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>
      </div>
    </div>
  );
}