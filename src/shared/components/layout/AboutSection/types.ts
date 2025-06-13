// Types for AboutSection component

export interface FeatureItem {
  title: string;
  icon: React.ReactNode;
}

export interface LocationInfo {
  title: string;
  address: string[];
  hostedBy?: {
    name: string;
    url?: string;
  };
  mapEmbedUrl: string;
}

export interface AboutSectionProps {
  title?: string;
  features?: FeatureItem[];
  locationInfo?: LocationInfo;
}
