#!/bin/bash

# Quick test script for conversations functionality
echo "Testing Conversations Functionality"
echo "==================================="

# Test the test-conversations route
echo ""
echo "1. Testing route accessibility..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5557/test-conversations
echo " - Test route HTTP status"

echo ""
echo "2. Opening test page in browser..."
echo "   Navigate to: http://localhost:5557/test-conversations"
echo ""
echo "   The test page will:"
echo "   - Check authentication status"
echo "   - Verify member profile exists"
echo "   - Fetch conversations list"
echo "   - Test conversation creation"
echo "   - Send test messages"
echo ""
echo "Please open http://localhost:5557/test-conversations in your browser to run the tests."