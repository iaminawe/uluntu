# Debug Instructions for Opportunity Detail Page

## 1. Test URLs

After starting the development server, try these URLs:

- http://localhost:5555/opportunities/1
- http://localhost:5555/opportunities/2
- http://localhost:5555/opportunities/3

## 2. Check Browser Console

Open the browser developer console (F12) and look for these logs:

1. `[OpportunityDetailPage] Component mounted with id: ...`
2. `[OpportunityDetailPage] queryFn called with id: ...`
3. `[OpportunitiesAPI.getById] Fetching opportunity with id: ...`
4. `[OpportunitiesAPI.getById] Supabase response: ...`
5. `[OpportunityDetailPage] API result: ...`
6. `[OpportunityDetailPage] Adapted opportunity: ...`
7. Either:
   - `[OpportunityDetailPage] Rendering LoadingState`
   - `[OpportunityDetailPage] Rendering ErrorState`
   - `[OpportunityDetailPage] Rendering opportunity detail`

## 3. Common Issues and Solutions

### No opportunities in database
If you see `Supabase response: { data: null, error: { code: 'PGRST116' ... } }`:
- Run the SQL script: `insert-test-opportunity.sql` in your Supabase SQL editor
- The API will return mock data if no opportunity is found

### Authentication issues
If you see 401 or 403 errors:
- Check that your Supabase environment variables are set correctly
- Ensure you're logged in if authentication is required

### Wrong environment
- Check that `VITE_USE_SUPABASE` is set to `true` if you want to use Supabase
- If not set or `false`, the app will use mock data

## 4. Quick Test

1. Navigate to http://localhost:5555/opportunities
2. Click on any opportunity card
3. Check if the detail page loads
4. Check the console for any errors

## 5. Mock Data

If no opportunities exist in your database, the system will automatically use mock data for testing. The mock opportunity includes:
- Title: Senior Full Stack Developer
- Company: Tech Innovators Inc.
- Location: Nelson, BC
- Type: Full-time
- Salary: $90,000 - $120,000

## 6. Expected Result

The opportunity detail page should show:
- A hero image with the opportunity title
- Job details including type, location, and salary
- Requirements, responsibilities, and benefits sections
- An apply button in the sidebar
- Company information