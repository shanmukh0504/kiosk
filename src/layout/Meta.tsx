import { FC } from "react";
import { Helmet } from "react-helmet";
import { AppConfig } from "./appConfig";
import metaImage from "/metadata.png";
import generatePageMetadata from "../utils/metaDataUtils";

export type IMetaProps = {
  title: string;
  description: string;
  canonical?: string;
};

export const Meta: FC<{ path?: string }> = ({ path = '/' }) => {
  const metadata = generatePageMetadata(path);

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <meta
        name="keywords"
        content={metadata.keywords?.join(', ') || ''}
      />

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta
        property="og:image"
        content={metadata.ogImage || metaImage}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={AppConfig.locale} />
      <meta property="og:site_name" content={AppConfig.site_name} />

      {/* Canonical Link */}
      <link
        rel="canonical"
        href={`${AppConfig.canonical}${metadata.canonical}`}
      />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@garden_finance" />
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta
        name="twitter:image"
        content={metadata.ogImage || metaImage}
      />
    </Helmet>
  );
};