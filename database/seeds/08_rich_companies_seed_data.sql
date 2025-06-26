-- =====================================================
-- RICH COMPANIES SEED DATA FOR NELSON TECH COMMUNITY
-- 15 Diverse Tech Companies with Full Details
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- COMPREHENSIVE TECH COMPANIES
-- =====================================================

INSERT INTO "public"."companies" ("id", "created_at", "name", "description", "logo", "cover_image", "industry", "size", "founded", "location", "website", "status", "featured") VALUES

-- 1. Large Enterprise Software Company
('11223344-5566-7788-99aa-bbccddeeff00', NOW() - INTERVAL '180 days', 
'Kootenay Enterprise Solutions', 
'Leading provider of enterprise resource planning (ERP) software for mid-market companies across Western Canada. Our cloud-based platform integrates financial management, supply chain operations, and customer relationship management into a unified system. With over 200 clients and a decade of innovation, we specialize in helping resource-based industries digitize their operations. Our team combines deep industry knowledge with cutting-edge technology to deliver solutions that drive efficiency and growth. We maintain offices in Nelson and Kelowna, with a distributed workforce across BC.',
'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
'{enterprise-software,saas,erp,cloud-computing}',
'50-100',
'2014',
'Nelson, BC',
'https://kootenayenterprise.com',
'published',
true),

-- 2. Innovative AI Startup
('22334455-6677-8899-aabb-ccddddeeff00', NOW() - INTERVAL '90 days',
'Alpine AI Labs',
'Cutting-edge artificial intelligence startup developing computer vision solutions for environmental monitoring and wildlife conservation. Our proprietary algorithms analyze camera trap data to track wildlife populations, detect poaching activities, and monitor ecosystem health. Founded by former Google AI researchers who relocated to the Kootenays for quality of life, we combine Silicon Valley innovation with BC''s natural beauty. Currently working with Parks Canada and conservation organizations worldwide.',
'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200',
'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200',
'{artificial-intelligence,machine-learning,conservation-tech,computer-vision}',
'10-25',
'2022',
'Nelson, BC',
'https://alpineailabs.ca',
'published',
true),

-- 3. Digital Marketing Agency
('33445566-7788-99aa-bbcc-ddeeffee2233', NOW() - INTERVAL '150 days',
'Mountain Peak Digital',
'Full-service digital marketing agency specializing in outdoor and adventure brands. We help companies in the outdoor recreation, tourism, and sustainable products sectors build authentic online presences that resonate with conscious consumers. Our services include brand strategy, content creation, social media management, SEO, and performance marketing. With deep roots in the outdoor community and expertise in digital marketing, we bridge the gap between adventure and technology.',
'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200',
'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200',
'{digital-marketing,branding,content-creation,seo}',
'15-30',
'2019',
'Castlegar, BC',
'https://mountainpeakdigital.com',
'published',
false),

-- 4. Fintech Innovator
('44556677-8899-aabb-ccdd-eeffee334455', NOW() - INTERVAL '120 days',
'Selkirk Financial Technologies',
'Fintech company revolutionizing banking for rural and remote communities. Our mobile-first banking platform provides comprehensive financial services to underserved populations across Canada. Features include digital wallets, micro-loans, peer-to-peer payments, and financial literacy tools. We partner with credit unions and community banks to extend their reach while maintaining local relationships. Our mission is to democratize access to financial services regardless of geographic location.',
'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200',
'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200',
'{fintech,banking,mobile-payments,financial-services}',
'25-50',
'2020',
'Trail, BC',
'https://selkirkfintech.ca',
'published',
true),

-- 5. Game Development Studio
('55667788-99aa-bbcc-ddee-ffee44556677', NOW() - INTERVAL '60 days',
'Wildfire Games Studio',
'Independent game development studio creating immersive story-driven experiences. Our award-winning team specializes in narrative adventures and indie titles that explore themes of nature, community, and human connection. Currently developing "Peaks & Valleys," an open-world exploration game set in the Canadian Rockies. We believe in sustainable game development practices and maintaining healthy work-life balance, which is why we chose to base our studio in the beautiful Kootenay region.',
'https://images.unsplash.com/photo-1556438064-2d7646166914?w=200',
'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200',
'{gaming,software-development,entertainment,creative-tech}',
'20-35',
'2021',
'Nelson, BC',
'https://wildfiregames.studio',
'published',
false),

-- 6. Cybersecurity Consultancy
('66778899-aabb-ccdd-eeff-556677889900', NOW() - INTERVAL '200 days',
'Guardian Cyber Defence',
'Boutique cybersecurity firm providing enterprise-grade security solutions to small and medium businesses. We specialize in security audits, penetration testing, incident response, and security awareness training. Our team of certified ethical hackers and security analysts brings big-company expertise to organizations that can''t afford full-time security teams. We believe every business deserves protection from cyber threats, regardless of size.',
'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=200',
'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200',
'{cybersecurity,consulting,information-security,risk-management}',
'8-15',
'2018',
'Rossland, BC',
'https://guardiancyber.ca',
'published',
false),

-- 7. EdTech Platform
('77889900-bbcc-ddee-ff00-112233445566', NOW() - INTERVAL '75 days',
'Summit Learning Technologies',
'Educational technology company developing adaptive learning platforms for K-12 and higher education. Our AI-powered system personalizes learning experiences based on individual student needs, learning styles, and progress. We work closely with BC school districts to improve educational outcomes while reducing teacher workload. Our platform includes virtual labs, interactive content, and real-time analytics to support data-driven instruction.',
'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200',
'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200',
'{edtech,education,e-learning,saas}',
'30-50',
'2019',
'Nelson, BC',
'https://summitlearning.tech',
'published',
true),

-- 8. Green Tech Startup
('88990011-ccdd-eeff-0011-223344556677', NOW() - INTERVAL '45 days',
'EcoMonitor Systems',
'Clean technology startup developing IoT sensors and analytics platforms for environmental monitoring. Our solar-powered sensor networks track air quality, water levels, soil conditions, and wildlife activity in real-time. We help municipalities, conservation groups, and resource companies make data-driven decisions for environmental protection. Our technology has been deployed in over 50 locations across BC to support climate adaptation and ecosystem management.',
'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=200',
'https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=1200',
'{cleantech,iot,environmental-tech,sustainability}',
'12-25',
'2021',
'Kaslo, BC',
'https://ecomonitorsystems.com',
'published',
false),

-- 9. Remote Work Platform
('99001122-ddee-ff00-1122-334455667788', NOW() - INTERVAL '100 days',
'Remote Valley',
'Platform connecting remote workers with mountain communities offering quality of life and outdoor recreation. We help tech professionals find their perfect work-from-home base while supporting local economies. Our services include community matching, co-working space booking, local networking events, and relocation support. We''re building a network of remote-work-friendly mountain towns across Western Canada.',
'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200',
'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200',
'{marketplace,remote-work,community-tech,lifestyle}',
'5-10',
'2023',
'Nelson, BC',
'https://remotevalley.ca',
'published',
true),

-- 10. Blockchain Development
('aa112233-eeff-0011-2233-445566778899', NOW() - INTERVAL '140 days',
'ChainPeak Technologies',
'Blockchain development company specializing in supply chain solutions for the natural resources sector. We help mining, forestry, and agricultural companies implement transparent, tamper-proof tracking systems from source to consumer. Our platform ensures ethical sourcing, regulatory compliance, and builds consumer trust through verifiable product histories. Currently working with several BC mining companies on responsible mineral certification.',
'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200',
'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1200',
'{blockchain,supply-chain,distributed-ledger,web3}',
'15-30',
'2020',
'Trail, BC',
'https://chainpeak.tech',
'published',
false),

-- 11. Health Tech Innovator
('bb223344-ff00-1122-3344-556677889900', NOW() - INTERVAL '110 days',
'Wellness Wave Digital',
'Digital health company creating connected wellness solutions for rural communities. Our telehealth platform integrates video consultations, remote patient monitoring, and health data analytics to improve healthcare access in underserved areas. We partner with regional health authorities to extend specialist care to remote locations, reducing travel burden on patients while maintaining quality of care.',
'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200',
'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200',
'{healthtech,telemedicine,digital-health,medical-software}',
'20-40',
'2019',
'Castlegar, BC',
'https://wellnesswave.digital',
'published',
true),

-- 12. Creative Tech Agency
('cc334455-0011-2233-4455-667788990011', NOW() - INTERVAL '85 days',
'Pixel Forest Creative',
'Boutique creative technology agency blending art, design, and code. We create immersive digital experiences, interactive installations, and creative campaigns for brands that dare to be different. Our team includes developers, designers, artists, and storytellers who push the boundaries of digital creativity. Recent projects include AR experiences for tourism, generative art installations, and experimental web experiences.',
'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200',
'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
'{creative-tech,digital-art,interactive-media,ar-vr}',
'8-15',
'2022',
'Nelson, BC',
'https://pixelforest.creative',
'published',
false),

-- 13. Data Analytics Firm
('dd445566-1122-3344-5566-778899001122', NOW() - INTERVAL '160 days',
'Insight Mountain Analytics',
'Business intelligence and data analytics consultancy helping organizations unlock the value of their data. We specialize in predictive analytics, data visualization, and machine learning solutions for retail, tourism, and natural resources sectors. Our team combines statistical expertise with industry knowledge to deliver actionable insights that drive business growth and operational efficiency.',
'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200',
'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
'{data-analytics,business-intelligence,consulting,machine-learning}',
'10-20',
'2020',
'Rossland, BC',
'https://insightmountain.ca',
'published',
false),

-- 14. Mobile App Development
('ee556677-2233-4455-6677-889900112233', NOW() - INTERVAL '70 days',
'AppCraft Studio',
'Mobile application development studio creating beautiful, functional apps for iOS and Android. We specialize in lifestyle, outdoor recreation, and local commerce apps that enhance how people interact with their communities and natural environments. Our portfolio includes award-winning apps for trail navigation, local business discovery, and community engagement. We believe great apps come from understanding user needs and local context.',
'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200',
'https://images.unsplash.com/photo-1600267175161-cfaa711b4a81?w=1200',
'{mobile-development,app-design,ios,android}',
'6-12',
'2021',
'Nelson, BC',
'https://appcraft.studio',
'published',
true),

-- 15. DevOps Consulting
('ff667788-3344-5566-7788-990011223344', NOW() - INTERVAL '130 days',
'Pipeline Dynamics',
'DevOps and cloud infrastructure consulting firm helping teams ship software faster and more reliably. We specialize in CI/CD pipeline optimization, infrastructure as code, container orchestration, and cloud cost optimization. Our consultants bring experience from leading tech companies to help startups and established businesses modernize their development practices. We''re passionate about automation, monitoring, and building resilient systems.',
'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=200',
'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
'{devops,cloud-infrastructure,consulting,automation}',
'10-25',
'2019',
'Kaslo, BC',
'https://pipelinedynamics.io',
'published',
false)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  logo = EXCLUDED.logo,
  cover_image = EXCLUDED.cover_image,
  industry = EXCLUDED.industry,
  size = EXCLUDED.size,
  founded = EXCLUDED.founded,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  created_at = EXCLUDED.created_at;

-- =====================================================
-- COMPANY SOCIAL LINKS (for companies table social field)
-- =====================================================

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/kootenay-enterprise',
  'twitter', 'https://twitter.com/kootenayerp',
  'github', 'https://github.com/kootenay-enterprise'
) WHERE id = '11223344-5566-7788-99aa-bbccddeeff00';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/alpine-ai-labs',
  'twitter', 'https://twitter.com/alpineailabs',
  'github', 'https://github.com/alpine-ai-labs',
  'instagram', 'https://instagram.com/alpineailabs'
) WHERE id = '22334455-6677-8899-aabb-ccddddeeff00';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/mountain-peak-digital',
  'instagram', 'https://instagram.com/mountainpeakdigital',
  'facebook', 'https://facebook.com/mountainpeakdigital',
  'youtube', 'https://youtube.com/@mountainpeakdigital'
) WHERE id = '33445566-7788-99aa-bbcc-ddeeffee2233';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/selkirk-fintech',
  'twitter', 'https://twitter.com/selkirkfintech'
) WHERE id = '44556677-8899-aabb-ccdd-eeffee334455';

UPDATE companies SET social = jsonb_build_object(
  'twitter', 'https://twitter.com/wildfiregames',
  'discord', 'https://discord.gg/wildfiregames',
  'twitch', 'https://twitch.tv/wildfiregames',
  'steam', 'https://store.steampowered.com/developer/wildfire'
) WHERE id = '55667788-99aa-bbcc-ddee-ffee44556677';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/guardian-cyber-defence',
  'twitter', 'https://twitter.com/guardiancyber'
) WHERE id = '66778899-aabb-ccdd-eeff-556677889900';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/summit-learning-tech',
  'twitter', 'https://twitter.com/summitlearning',
  'youtube', 'https://youtube.com/@summitlearningtech'
) WHERE id = '77889900-bbcc-ddee-ff00-112233445566';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/ecomonitor-systems',
  'twitter', 'https://twitter.com/ecomonitor',
  'github', 'https://github.com/ecomonitor'
) WHERE id = '88990011-ccdd-eeff-0011-223344556677';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/remote-valley',
  'twitter', 'https://twitter.com/remotevalley',
  'instagram', 'https://instagram.com/remotevalley',
  'facebook', 'https://facebook.com/remotevalley'
) WHERE id = '99001122-ddee-ff00-1122-334455667788';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/chainpeak-tech',
  'github', 'https://github.com/chainpeak',
  'medium', 'https://medium.com/@chainpeak'
) WHERE id = 'aa112233-eeff-0011-2233-445566778899';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/wellness-wave-digital',
  'twitter', 'https://twitter.com/wellnesswave',
  'youtube', 'https://youtube.com/@wellnesswavedigital'
) WHERE id = 'bb223344-ff00-1122-3344-556677889900';

UPDATE companies SET social = jsonb_build_object(
  'instagram', 'https://instagram.com/pixelforestcreative',
  'behance', 'https://behance.net/pixelforest',
  'dribbble', 'https://dribbble.com/pixelforest',
  'vimeo', 'https://vimeo.com/pixelforest'
) WHERE id = 'cc334455-0011-2233-4455-667788990011';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/insight-mountain',
  'twitter', 'https://twitter.com/insightmountain'
) WHERE id = 'dd445566-1122-3344-5566-778899001122';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/appcraft-studio',
  'instagram', 'https://instagram.com/appcraftstudio',
  'github', 'https://github.com/appcraft-studio',
  'producthunt', 'https://producthunt.com/@appcraftstudio'
) WHERE id = 'ee556677-2233-4455-6677-889900112233';

UPDATE companies SET social = jsonb_build_object(
  'linkedin', 'https://linkedin.com/company/pipeline-dynamics',
  'github', 'https://github.com/pipeline-dynamics',
  'twitter', 'https://twitter.com/pipelinedynamics'
) WHERE id = 'ff667788-3344-5566-7788-990011223344';

-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- Check company counts by location
SELECT location, COUNT(*) as company_count 
FROM companies 
WHERE status = 'published'
GROUP BY location
ORDER BY company_count DESC;

-- Check company counts by size
SELECT size, COUNT(*) as company_count 
FROM companies 
WHERE status = 'published'
GROUP BY size
ORDER BY company_count DESC;

-- Check featured companies
SELECT name, location, size, founded
FROM companies 
WHERE featured = true AND status = 'published'
ORDER BY created_at DESC;

-- Check industry distribution
SELECT industry_tag, COUNT(*) as tag_count
FROM companies, UNNEST(industry) AS industry_tag
WHERE status = 'published'
GROUP BY industry_tag
ORDER BY tag_count DESC
LIMIT 20;

COMMIT;