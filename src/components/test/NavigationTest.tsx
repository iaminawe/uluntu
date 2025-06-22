import React from 'react';
import Header from '@/shared/components/layout/Header';

export default function NavigationTest() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="pt-24 p-8">
        <h1 className="text-3xl font-bold mb-4">Navigation Test Page</h1>
        <p className="text-gray-600 mb-8">
          This page tests the new dropdown navigation system. The header above should show:
        </p>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Expected Navigation Structure:</h2>
          <ul className="space-y-2">
            <li>
              <strong>Community</strong> (dropdown)
              <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                <li>• Events - Workshops, meetups, and tech talks</li>
                <li>• Directory - Connect with tech professionals</li>
                <li>• Groups - Join communities of interest</li>
                <li>• News - Latest tech news and articles</li>
              </ul>
            </li>
            <li>
              <strong>Business</strong> (dropdown)
              <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                <li>• Companies - Explore local tech companies</li>
                <li>• Opportunities - Find jobs and volunteer roles</li>
                <li>• Marketplace - Buy and sell tech items</li>
              </ul>
            </li>
            <li>
              <strong>Resources</strong> (single link)
              <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                <li>• Educational content and guides</li>
              </ul>
            </li>
            <li>
              <strong>About</strong> (dropdown)
              <ul className="ml-4 mt-1 space-y-1 text-gray-600">
                <li>• About Us - Learn about our mission</li>
                <li>• Contact - Get in touch with us</li>
                <li>• Privacy - Privacy policy and data protection</li>
                <li>• Terms - Terms of service and guidelines</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-xl font-semibold mb-4">Features to Test:</h2>
          <ul className="space-y-2 text-gray-600">
            <li>✓ Hover over "Community" or "Business" to see dropdown (desktop)</li>
            <li>✓ Click on "Community" or "Business" to toggle dropdown (mobile)</li>
            <li>✓ Keyboard navigation with Tab, Enter, Space, and Escape</li>
            <li>✓ ARIA attributes for accessibility</li>
            <li>✓ Responsive behavior on different screen sizes</li>
            <li>✓ Click outside to close dropdowns</li>
            <li>✓ Mobile hamburger menu with collapsible dropdowns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}