-- Add missing RPC functions for newsletter analytics

-- Function to get campaign analytics
CREATE OR REPLACE FUNCTION get_campaign_analytics(p_campaign_id UUID)
RETURNS TABLE (
  campaign_id UUID,
  sent_count BIGINT,
  delivered_count BIGINT,
  opened_count BIGINT,
  clicked_count BIGINT,
  bounced_count BIGINT,
  unsubscribed_count BIGINT,
  complained_count BIGINT,
  open_rate NUMERIC,
  click_rate NUMERIC,
  bounce_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH analytics_counts AS (
    SELECT 
      na.campaign_id,
      COUNT(*) FILTER (WHERE na.event_type = 'sent') AS sent_count,
      COUNT(*) FILTER (WHERE na.event_type = 'delivered') AS delivered_count,
      COUNT(*) FILTER (WHERE na.event_type = 'opened') AS opened_count,
      COUNT(*) FILTER (WHERE na.event_type = 'clicked') AS clicked_count,
      COUNT(*) FILTER (WHERE na.event_type = 'bounced') AS bounced_count,
      COUNT(*) FILTER (WHERE na.event_type = 'unsubscribed') AS unsubscribed_count,
      COUNT(*) FILTER (WHERE na.event_type = 'complained') AS complained_count
    FROM newsletter_analytics na
    WHERE na.campaign_id = p_campaign_id
    GROUP BY na.campaign_id
  )
  SELECT 
    ac.campaign_id,
    ac.sent_count,
    ac.delivered_count,
    ac.opened_count,
    ac.clicked_count,
    ac.bounced_count,
    ac.unsubscribed_count,
    ac.complained_count,
    CASE 
      WHEN ac.delivered_count > 0 THEN ROUND((ac.opened_count::NUMERIC / ac.delivered_count::NUMERIC) * 100, 2)
      ELSE 0::NUMERIC
    END AS open_rate,
    CASE 
      WHEN ac.opened_count > 0 THEN ROUND((ac.clicked_count::NUMERIC / ac.opened_count::NUMERIC) * 100, 2)
      ELSE 0::NUMERIC
    END AS click_rate,
    CASE 
      WHEN ac.sent_count > 0 THEN ROUND((ac.bounced_count::NUMERIC / ac.sent_count::NUMERIC) * 100, 2)
      ELSE 0::NUMERIC
    END AS bounce_rate
  FROM analytics_counts ac;
END;
$$ LANGUAGE plpgsql;

-- Function to get subscription analytics
CREATE OR REPLACE FUNCTION get_subscription_analytics()
RETURNS TABLE (
  total_subscriptions BIGINT,
  active_subscriptions BIGINT,
  pending_subscriptions BIGINT,
  bounced_subscriptions BIGINT,
  unsubscribed_subscriptions BIGINT,
  subscriptions_this_month BIGINT,
  unsubscribes_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') AS active_subscriptions,
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_subscriptions,
    COUNT(*) FILTER (WHERE status = 'bounced') AS bounced_subscriptions,
    COUNT(*) FILTER (WHERE status = 'unsubscribed') AS unsubscribed_subscriptions,
    COUNT(*) FILTER (WHERE subscribed_at >= DATE_TRUNC('month', CURRENT_DATE)) AS subscriptions_this_month,
    COUNT(*) FILTER (WHERE unsubscribed_at >= DATE_TRUNC('month', CURRENT_DATE)) AS unsubscribes_this_month
  FROM newsletter_subscriptions;
END;
$$ LANGUAGE plpgsql;

-- Function to get campaign overview stats
CREATE OR REPLACE FUNCTION get_campaign_overview()
RETURNS TABLE (
  total_campaigns BIGINT,
  draft_campaigns BIGINT,
  scheduled_campaigns BIGINT,
  sent_campaigns BIGINT,
  avg_open_rate NUMERIC,
  avg_click_rate NUMERIC,
  total_subscribers_reached BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH campaign_stats AS (
    SELECT 
      nc.id,
      nc.status,
      (nc.delivery_stats->>'sent')::BIGINT as sent_count,
      (nc.delivery_stats->>'opened')::BIGINT as opened_count,
      (nc.delivery_stats->>'clicked')::BIGINT as clicked_count
    FROM newsletter_campaigns nc
  )
  SELECT 
    COUNT(*) AS total_campaigns,
    COUNT(*) FILTER (WHERE status = 'draft') AS draft_campaigns,
    COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled_campaigns,
    COUNT(*) FILTER (WHERE status = 'sent') AS sent_campaigns,
    CASE 
      WHEN SUM(sent_count) > 0 THEN ROUND((SUM(opened_count)::NUMERIC / SUM(sent_count)::NUMERIC) * 100, 2)
      ELSE 0::NUMERIC
    END AS avg_open_rate,
    CASE 
      WHEN SUM(opened_count) > 0 THEN ROUND((SUM(clicked_count)::NUMERIC / SUM(opened_count)::NUMERIC) * 100, 2)
      ELSE 0::NUMERIC
    END AS avg_click_rate,
    COALESCE(SUM(sent_count), 0) AS total_subscribers_reached
  FROM campaign_stats;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions to authenticated users (admins will be filtered by RLS)
GRANT EXECUTE ON FUNCTION get_campaign_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_campaign_overview() TO authenticated;